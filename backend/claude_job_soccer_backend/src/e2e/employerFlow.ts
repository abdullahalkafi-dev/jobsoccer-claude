import { Types } from "mongoose";
import { FriendList } from "../modules/friendlist/friendlist.model";
import { User } from "../modules/user/user.model";
import { Check, E2E, call, check, emailFor, tinyPng } from "./support";

/**
 * The employer side for one candidate: before access the assessment is blocked,
 * after the candidate accepts the request the employer sees the overall section only.
 */

export interface EmployerRun {
  email: string;
  steps: { name: string; ms: number; httpStatus: number | null; note?: string }[];
  viewAfter?: any;
  checks: Check[];
  error?: string;
}

const CLUB_PROFILE = {
  country: "United Kingdom",
  address: "1 Stadium Road, Manchester",
  location: "Manchester",
  level: "Professional",
  founded: "1901",
  website: "https://e2e-club.example.com",
  nationality: "English",
  phoneNumber: "+447700900200",
  clubName: "E2E Test United",
  clubContact: "scouting@e2e-club.example.com",
  clubDescription: "Throw-away employer account used by the automated end-to-end test.",
};

export const runEmployerAccess = async (candidateEmail: string, candidateToken: string): Promise<EmployerRun> => {
  const email = emailFor("employer.club");
  const run: EmployerRun = { email, steps: [], checks: [] };
  const step = (name: string, ms: number, httpStatus: number | null, note?: string) => run.steps.push({ name, ms, httpStatus, note });

  try {
    const candidate = await User.findOne({ email: candidateEmail });
    if (!candidate) throw new Error("Candidate not found");
    const candidateId = candidate._id.toString();

    const signup = await call("POST", "/auth/signup", {
      json: { firstName: "Test", lastName: "Club", email, role: "Professional Club", password: E2E.password, loginProvider: "email", userType: "employer" },
    });
    const exists = !signup.ok && /already exists/i.test(JSON.stringify(signup.body));
    step("signup", signup.ms, signup.status, exists ? "account already existed" : undefined);
    if (!signup.ok && !exists) throw new Error(`Employer signup failed: ${JSON.stringify(signup.body)}`);

    let user = await User.findOne({ email });
    if (!user) throw new Error("Employer not found in the dev database");
    if (!user.isVerified) {
      const verify = await call("POST", "/auth/verify-email", { json: { email, oneTimeCode: E2E.otp, reason: "account_verification" } });
      step("verify-email", verify.ms, verify.status);
      if (!verify.ok) throw new Error(`Employer verify failed: ${JSON.stringify(verify.body)}`);
    }
    const login = await call("POST", "/auth/login", { json: { email, password: E2E.password, loginProvider: "email" } });
    step("login", login.ms, login.status);
    const token: string | undefined = login.body?.data?.accessToken ?? login.body?.data?.data?.accessToken;
    if (!token) throw new Error(`Employer login failed: ${JSON.stringify(login.body)}`);

    user = await User.findById(user._id);
    if (!user?.profileId) {
      const form = new FormData();
      form.append("data", JSON.stringify(CLUB_PROFILE));
      form.append("image", new Blob([new Uint8Array(tinyPng())], { type: "image/png" }), "logo.png");
      const created = await call("POST", "/user/profile", { token, form });
      step("create-profile", created.ms, created.status);
      if (!created.ok) throw new Error(`Employer profile failed: ${JSON.stringify(created.body).slice(0, 300)}`);
    }
    const employerId = user!._id.toString();

    // Before the candidate gives access
    const hasLink = await FriendList.exists({
      status: "accepted",
      $or: [
        { senderId: new Types.ObjectId(employerId), receiverId: new Types.ObjectId(candidateId) },
        { senderId: new Types.ObjectId(candidateId), receiverId: new Types.ObjectId(employerId) },
      ],
    });
    if (!hasLink) {
      const before = await call("GET", `/ai-evaluation/candidate/${candidateId}`, { token });
      step("view-before-access", before.ms, before.status);
      check(run.checks, "E1", "Employer without access is blocked (HTTP 403)", before.status === 403, `HTTP ${before.status}`);

      const requested = await call("POST", "/friendlist", { token, json: { receiverId: candidateId } });
      step("send-access-request", requested.ms, requested.status);
      check(run.checks, "E2", "Employer can send an access request", requested.ok, `HTTP ${requested.status}`);

      const request = await FriendList.findOne({ senderId: new Types.ObjectId(employerId), receiverId: new Types.ObjectId(candidateId) }).sort({ createdAt: -1 });
      if (!request) throw new Error("Access request not found in the database");
      const accepted = await call("PATCH", `/friendlist/${request._id.toString()}`, { token: candidateToken, json: { status: "accepted" } });
      step("candidate-accepts", accepted.ms, accepted.status);
      check(run.checks, "E3", "Candidate can accept the request", accepted.ok, `HTTP ${accepted.status}`);
    } else {
      step("access", 0, null, "skipped: already connected from an earlier run");
    }

    const after = await call("GET", `/ai-evaluation/candidate/${candidateId}`, { token });
    step("view-after-access", after.ms, after.status);
    run.viewAfter = after.body?.data;
    const report = run.viewAfter?.report;
    check(run.checks, "E4", "Employer sees the overall assessment after access", after.ok && typeof report?.totalScore === "number", `HTTP ${after.status}`);
    check(run.checks, "E5", "Employer view has no question-by-question detail", !!report && !("questions" in report) && !("transcript" in report), "keys: " + Object.keys(report ?? {}).join(", "));
  } catch (error: any) {
    run.error = error.message;
  }
  return run;
};
