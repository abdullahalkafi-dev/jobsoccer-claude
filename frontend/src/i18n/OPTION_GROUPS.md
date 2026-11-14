# Option label groups (messages/<locale>/options.json)

Usage: `const label = useOptionLabel(); label("position", value)`. Key = `<group>.<optionSlug(value)>`. Unknown values fall back to the stored English string. Sort dropdowns with `sortByLabel(values, (v) => label("country", v), locale)` from `src/i18n/sort.ts`.
Run `npm run i18n:options` (stored values from `src/constants` all have labels) and `npm run i18n:check`.

| Group | Stored values | Source | Used in |
|---|---|---|---|
| role | Professional Player, Amateur Player, High School Player, College/University Player, On field staff (label "On-Field Staff"), Office Staff, plus employer roles | backend `modules/user/user.interface.ts` CandidateRole/EmployerRole; frontend `roleLabel()` in `constants/selectOptions.ts` | candidates/search page.tsx:83, employers/search page.tsx:77, JobCategories.tsx:63, job `jobCategory` (jobs/[id]/page.tsx:290,422), CreateJobPostModal category select |
| employerType | Professional Club, Academy, Amateur Club, Consulting Company, High School, College/University, Agent | EmployerRole | employer profile pages, employer cards |
| userType | candidate, employer, admin | backend UserType | profile/employer/hiring/page.tsx:161 |
| position | all player, on-field staff and office staff positions (+ Goalkeeper, Midfielder, Winger, Center back, Sporting Director, Analyst, Physio) | selectOptions.ts playerPositionOptions/fieldStaffPositionOptions/officeStaffPositionOptions; backend `shared/constant/position.constant.ts` | *ProfessionalInfoForm.tsx (SelectItem at ~173 Field, ~152 Office, player forms), EditProfileModal.tsx:332-368, candidates/[id]/page.tsx:331, profile/candidate/page.tsx:282, CandidateCard.tsx:212, JobCard.tsx:241, HomeJobCard.tsx:240, jobs/[id]/page.tsx:255,386, CreateJobPostModal |
| country | 197 countries from countryList + aliases (England, Scotland, Wales, Northern Ireland, Côte d'Ivoire, Türkiye, Czechia, Cape Verde, USA, UK...). "Palestine State" labelled "Palestine" | selectOptions.ts countryList (same as backend `country.constant.ts`) | all *EmployerProfileForm.tsx country SelectItem (e.g. Academy:152, Agent:145, AmateurClub:135, College:138, Consulting:153, HighSchool:148, ProfessionalClub:134), EditProfileModal.tsx:524, candidates/[id]:342,429, profile/candidate:322,422, employers/[id]:350,451, profile/employer:290,384, candidate/employer search filters (:88/:82), CandidateCard.tsx:254 (nationality) |
| month | January..December | `constants/profile.ts` months; backend `month.constant.ts` | experience/education modals, date pickers |
| gender | Male, Female, Other | genderOptions | EditProfileModal.tsx:310, candidates/[id]:352, profile/candidate:345 |
| unit | cm, m, in, ft, kg, lb | heightUnitOptions/weightUnitOptions | player forms (height/weight selects) |
| category | U14..U21 (also slug u_19 style), Current International, Adult, Senior | national team category lists | player forms, EditProfileModal.tsx:608,659, profile/candidate:478 |
| foot | Right, Left, Both | footOptions | player forms, EditProfileModal.tsx:491, candidates/[id]:407, profile/candidate:400 |
| division | "1".."4" and "Division 1".."Division 4" | divisionLevelOptions; employer forms hard-code `SelectItem value="Division n"` | *EmployerProfileForm.tsx (Academy:192-195, AmateurClub:172-175, College:183-186, Consulting:192-195, HighSchool:196-199, ProfessionalClub:185-188) |
| jobType | FullTime, PartTime, Contract (+ Full Time, Part Time, Internship) | backend job.model contractType | HomeJobCard.tsx:247, JobCard.tsx:244, AddExperienceModal.tsx:156-158, EditExperienceModal.tsx:184-186, CreateJobPostModal.tsx:66-68, jobs/[id]:216,273,404 |
| experience | Entry Level, Intermediate, Mid-Level, Mid-Senior, Senior | backend job.model experience | JobFilters.tsx:138, CreateJobPostModal.tsx:72, jobs/[id]:282,413 |
| postedDate | Last Week, Last Month, Last 3 Months, Last 6 Months, This Month, Any Time | JobFilters.tsx:126-129, backend job.constants DateFilterEnum | JobFilters.tsx |
| jobStatus | active, closed, draft, expired | backend job.model status | employer job lists |
| premium | "true", "false" (premium vs standard jobs filter) | JobFilters.tsx:132-135 | JobFilters.tsx |

Not covered (free text / not enumerations): availability (free text), location, placeOfBirth, years.
