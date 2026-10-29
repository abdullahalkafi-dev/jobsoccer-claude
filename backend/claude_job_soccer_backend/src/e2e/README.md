# End-to-end flow with fake candidates (staging only)

Runs real candidates through the real API: sign-up, e-mail code, login, profile + videos,
AI profile score, queue, AI interview assessment, candidate view, employer access rules.
Only the speech-to-text result of each fake video is pre-loaded (transcript cache, keyed by the file's SHA-256).

```
pnpm e2e:flow --role head_coach                    # all fake candidates of the role
pnpm e2e:flow --role head_coach --only best,bad    # some of them
pnpm e2e:flow --role head_coach --no-employer      # skip the employer access check
```

From the staging server (after a backend rebuild):

```
docker exec -e E2E_API_BASE=http://localhost:8000/api/v1 jobsoccer_backend_staging node dist/e2e/run.js --role head_coach
```

Results are printed and saved to `logs/e2e/<role>-<time>.json` (per question: score, evidence, rationale, flags, tokens, cost, timings).

## Safety
- Refuses any API host except `api-dev.jobsoccer.com`, `localhost`, `127.0.0.1`.
- Refuses to start unless `APP_ENV` is set and not `production`, and the database does not match `PROTECTED_DB_MARKERS`.
- Test accounts are `e2e.<role>.<level>@e2e.jobsoccer.test`, password and e-mail code are public (`support.ts`). Re-running reuses the accounts: it uploads new videos, which starts a new assessment.
- Nothing is deleted.

## Add a role
1. Copy `personas/headCoach.ts` to `personas/<role>.ts`: set `role`, `position`, `rubricId`, `videoTypes` (see `shared/constant/videoRequirements.config.ts`), the required profile fields, and 4-5 fake candidates (bad, weak, good, best, incomplete) written from the client's scoring guide, never from the AI's output.
2. Register it in `SCENARIOS` in `run.ts`.
3. Run it, read the numbers, then set the expected ranges.

Not covered yet: real speech-to-text, job apply / job match, admin review screen, office staff.
Before the AI goes live on `main`, exclude `src/e2e` from the production build.
