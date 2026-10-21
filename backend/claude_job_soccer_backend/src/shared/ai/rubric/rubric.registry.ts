import { normalizeOnFieldPosition } from "../../constant/video.constant";
import { Rubric, RubricBase, rubricBaseSchema, RubricFile, rubricFileSchema } from "./rubric.schema";

// Imported (not read from disk) so tsc copies the JSON into dist/ and the Docker image.
import interviewBase from "./rubrics/interview.base.v1.json";
import academyDirector from "./rubrics/on_field_staff.academy_director.v1.json";
import assistantCoachAmateur from "./rubrics/on_field_staff.assistant_coach.amateur.v1.json";
import attackingCoach from "./rubrics/on_field_staff.attacking_coach.v1.json";
import defensiveCoach from "./rubrics/on_field_staff.defensive_coach.v1.json";
import directorOfCoaching from "./rubrics/on_field_staff.director_of_coaching.v1.json";
import goalkeeperCoach from "./rubrics/on_field_staff.goalkeeper_coach.v1.json";
import headCoachAmateur from "./rubrics/on_field_staff.head_coach.amateur.v1.json";
import mentalCoach from "./rubrics/on_field_staff.mental_coach.v1.json";
import scout from "./rubrics/on_field_staff.scout.v1.json";
import technicalDevelopmentCoach from "./rubrics/on_field_staff.technical_development_coach.v1.json";
import technicalDirector from "./rubrics/on_field_staff.technical_director.v1.json";
import videoAnalyst from "./rubrics/on_field_staff.video_analyst.v1.json";

const BASES: unknown[] = [interviewBase];

const RUBRIC_FILES: unknown[] = [
  academyDirector,
  assistantCoachAmateur,
  attackingCoach,
  defensiveCoach,
  directorOfCoaching,
  goalkeeperCoach,
  headCoachAmateur,
  mentalCoach,
  scout,
  technicalDevelopmentCoach,
  technicalDirector,
  videoAnalyst,
];

/** Merge a position file with its base; validated, so a broken file fails at startup. */
const buildRubric = (file: RubricFile, bases: Map<string, RubricBase>): Rubric => {
  const base = bases.get(file.extends ?? "interview.base.v1");
  if (!base) throw new Error(`Rubric ${file.rubricId}: unknown base "${file.extends}"`);

  const bands = file.bands ?? base.defaultBands[String(file.maxTotalScore)];
  if (!bands) throw new Error(`Rubric ${file.rubricId}: no bands for max score ${file.maxTotalScore}`);

  return {
    ...file,
    bands,
    scale: base.scale,
    consistencyClassifications: base.consistencyClassifications,
    outputRequirements: base.outputRequirements,
    humanOversight: base.humanOversight,
    fairness: base.fairness,
    questionCount: file.sections.reduce((n, s) => n + s.questions.length, 0),
  };
};

export const loadRubrics = (files: unknown[] = RUBRIC_FILES, rawBases: unknown[] = BASES): Map<string, Rubric> => {
  const bases = new Map<string, RubricBase>();
  for (const raw of rawBases) {
    const base = rubricBaseSchema.parse(raw);
    bases.set(base.baseId, base);
  }

  const rubrics = new Map<string, Rubric>();
  for (const raw of files) {
    const result = rubricFileSchema.safeParse(raw);
    if (!result.success) {
      const id = (raw as { rubricId?: string })?.rubricId ?? "unknown";
      throw new Error(`Invalid rubric ${id}: ${result.error.message}`);
    }
    if (rubrics.has(result.data.rubricId)) throw new Error(`Duplicate rubric ${result.data.rubricId}`);
    rubrics.set(result.data.rubricId, buildRubric(result.data, bases));
  }
  return rubrics;
};

const registry = loadRubrics();

export const listRubrics = (): Rubric[] => [...registry.values()];

export const getRubric = (rubricId: string): Rubric | null => registry.get(rubricId) ?? null;

/**
 * Pick the rubric for a candidate: same role and position, then the requested
 * level; without a level, a level-free rubric wins, otherwise the only levelled
 * one (e.g. Head Coach uses the Amateur guide until a Professional one exists).
 * Highest version wins.
 */
export const resolveRubric = (params: { role: string; position: string; level?: string | null }): Rubric | null => {
  const position = normalizeOnFieldPosition(params.position);
  const candidates = listRubrics()
    .filter((r) => r.role === params.role && r.position === position)
    .sort((a, b) => b.version - a.version);
  if (candidates.length === 0) return null;

  if (params.level) {
    return candidates.find((r) => r.level === params.level) ?? null;
  }
  const levelFree = candidates.find((r) => !r.level);
  if (levelFree) return levelFree;
  const levels = new Set(candidates.map((r) => r.level));
  return levels.size === 1 ? candidates[0] : null;
};

/** Map a total score to its band label. */
export const bandFor = (rubric: Rubric, total: number): string | null =>
  rubric.bands.find((b) => total >= b.min && total <= b.max)?.label ?? null;
