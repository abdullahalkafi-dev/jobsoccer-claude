# End-to-end flow with fake candidates (staging / local only)

Runs real candidates through the real API: sign-up, e-mail code, login, profile, consent,
**one video per request**, the 3-month lock, the Profile Quality Score, the queue, the AI interview
assessment, the candidate's own view and the employer access rules.
Only the speech-to-text result of each test video is pre-loaded (transcript cache, keyed by the file's SHA-256).
The videos themselves are real, valid 720p MP4 files (made with ffmpeg), so the real upload checks run.

```
pnpm e2e:flow --role head_coach                    # all fake candidates of the role
pnpm e2e:flow --role head_coach --only best,bad    # some of them
pnpm e2e:flow --role head_coach --no-employer      # skip the employer access check
```

Against a local server (Redis + `node dist/server.js` with ffmpeg/ffprobe on `PATH`):

```
E2E_API_BASE=http://localhost:8000/api/v1 pnpm e2e:flow --role head_coach
```

From the staging server (after a backend rebuild):

```
docker exec -e E2E_API_BASE=http://localhost:8000/api/v1 jobsoccer_backend_staging node dist/e2e/run.js --role head_coach
```

Results are printed and saved to `logs/e2e/<role>-<time>.json` (per question: score, evidence, rationale, flags, tokens, cost, timings).

## Safety
- Refuses any API host except `api-dev.jobsoccer.com`, `localhost`, `127.0.0.1`.
- Refuses to start unless `APP_ENV` is set and not `production`, and the database does not match `PROTECTED_DB_MARKERS`.
- Test accounts are `e2e.<role>.<level>@e2e.jobsoccer.test`, password and e-mail code are public (`support.ts`). Re-running reuses the accounts: the video locks of those accounts are lifted in the dev database, then new videos are uploaded, which starts a new assessment.
- Nothing is deleted.

## Add a role
1. Copy `personas/headCoach.ts` to `personas/<role>.ts`: set `role`, `position`, `rubricId`, `videoKinds` (see `modules/video/video.config.ts`), the required profile fields, and 4-5 fake candidates (bad, weak, good, best, incomplete) written from the client's scoring guide, never from the AI's output.
2. Register it in `SCENARIOS` in `run.ts`.
3. Run it, read the numbers, then set the expected ranges.

Not covered yet: real speech-to-text (accuracy + time), job apply / job match, admin screens, player roles.
Before the AI goes live on `main`, exclude `src/e2e` from the production build.
