import { AiLang } from "../../shared/ai/i18n/lang";
import { TProfileLevel, TQualityCategory } from "./profileQuality.interface";

/**
 * Static English / Spanish / French catalog of everything the Profile Quality rules say:
 * category labels, item labels, level labels and improvement tips. No LLM involved.
 * The English entries are the single source: the rules build their stored English text from here.
 */

type Texts = Record<AiLang, string>;

export const CATEGORY_LABELS: Record<TQualityCategory["key"], Texts> = {
  completion: { en: "Profile Completion", es: "Perfil completo", fr: "Profil complété" },
  verification: { en: "Verification & Credentials", es: "Verificación y credenciales", fr: "Vérification et qualifications" },
  media: { en: "Media Portfolio", es: "Portafolio multimedia", fr: "Portfolio multimédia" },
  maintenance: { en: "Maintenance & Responsiveness", es: "Mantenimiento y capacidad de respuesta", fr: "Mise à jour et réactivité" },
};

export const LEVEL_LABELS: Record<TProfileLevel, Texts> = {
  premium: { en: "Premium Qualified", es: "Premium cualificado", fr: "Premium qualifié" },
  advanced: { en: "Advanced", es: "Avanzado", fr: "Avancé" },
  complete: { en: "Complete", es: "Completo", fr: "Complet" },
  developing: { en: "Developing", es: "En desarrollo", fr: "En développement" },
  incomplete: { en: "Incomplete", es: "Incompleto", fr: "Incomplet" },
};

export const ITEM_LABELS: Record<string, Texts> = {
  basicsStaff: { en: "Personal and role details", es: "Datos personales y del puesto", fr: "Informations personnelles et du poste" },
  basicsPlayer: { en: "Personal details", es: "Datos personales", fr: "Informations personnelles" },
  social: { en: "Social media", es: "Redes sociales", fr: "Réseaux sociaux" },
  experience: { en: "Experience history", es: "Historial de experiencia", fr: "Parcours professionnel" },
  education: { en: "Education", es: "Formación", fr: "Formation" },
  licenses: { en: "Licences and certifications", es: "Licencias y certificaciones", fr: "Licences et certifications" },
  identity: { en: "Identity verified", es: "Identidad verificada", fr: "Identité vérifiée" },
  credentials: { en: "Qualifications verified", es: "Cualificaciones verificadas", fr: "Qualifications vérifiées" },
  workHistoryVerified: { en: "Work history verified", es: "Historial laboral verificado", fr: "Parcours professionnel vérifié" },
  photo: { en: "Profile photo", es: "Foto de perfil", fr: "Photo de profil" },
  cv: { en: "CV", es: "CV", fr: "CV" },
  interview: { en: "Video interview", es: "Entrevista en vídeo", fr: "Entretien vidéo" },
  methodology: { en: "Methodology video", es: "Vídeo de metodología", fr: "Vidéo de méthodologie" },
  availability: { en: "Availability up to date", es: "Disponibilidad actualizada", fr: "Disponibilité à jour" },
  freshness: { en: "Profile recently updated", es: "Perfil actualizado recientemente", fr: "Profil mis à jour récemment" },
  responsiveness: { en: "Replies to messages", es: "Respuesta a mensajes", fr: "Réponses aux messages" },
  sporting: { en: "Position and club", es: "Posición y club", fr: "Poste et club" },
  contact: { en: "Contact and social media", es: "Contacto y redes sociales", fr: "Contact et réseaux sociaux" },
  schoolDetails: { en: "School details", es: "Datos del centro de estudios", fr: "Informations scolaires" },
  careerDetails: { en: "Career details", es: "Datos de la carrera", fr: "Informations de carrière" },
  clubHistory: { en: "Club history", es: "Historial de clubes", fr: "Historique des clubs" },
  clubHistoryVerified: { en: "Club history verified", es: "Historial de clubes verificado", fr: "Historique des clubs vérifié" },
  highlights: { en: "Highlight videos", es: "Vídeos de mejores jugadas", fr: "Vidéos de meilleurs moments" },
};

/** Profile fields named inside the "add your ..." tip. */
export const FIELD_LABELS: Record<string, Texts> = {
  dateOfBirth: { en: "date of birth", es: "fecha de nacimiento", fr: "date de naissance" },
  placeOfBirth: { en: "place of birth", es: "lugar de nacimiento", fr: "lieu de naissance" },
  nationality: { en: "nationality", es: "nacionalidad", fr: "nationalité" },
  country: { en: "country", es: "país", fr: "pays" },
  gender: { en: "gender", es: "género", fr: "genre" },
  currentClub: { en: "current club", es: "club actual", fr: "club actuel" },
  phoneNumber: { en: "phone number", es: "número de teléfono", fr: "numéro de téléphone" },
  league: { en: "league", es: "liga", fr: "championnat" },
  height: { en: "height", es: "altura", fr: "taille" },
  weight: { en: "weight", es: "peso", fr: "poids" },
  foot: { en: "preferred foot", es: "pierna preferida", fr: "pied préféré" },
  position: { en: "position", es: "posición", fr: "poste" },
  division: { en: "division", es: "división", fr: "division" },
  teamsJoined: { en: "teams joined", es: "equipos en los que has jugado", fr: "équipes rejointes" },
  contractExpires: { en: "contract end date", es: "fecha de fin de contrato", fr: "date de fin de contrat" },
  nationalTeamGames: { en: "national team games", es: "partidos con la selección", fr: "matchs en équipe nationale" },
  schoolName: { en: "school", es: "centro de estudios", fr: "établissement" },
  gpa: { en: "GPA", es: "nota media (GPA)", fr: "moyenne (GPA)" },
  satOrAct: { en: "SAT/ACT", es: "SAT/ACT", fr: "SAT/ACT" },
  category: { en: "category", es: "categoría", fr: "catégorie" },
  collegeOrUniversity: { en: "college or university", es: "college o universidad", fr: "college ou université" },
  diploma: { en: "diploma", es: "diploma", fr: "diplôme" },
  nationalTeamCategory: { en: "national team category", es: "categoría de la selección", fr: "catégorie de l'équipe nationale" },
  socialMedia: { en: "social media", es: "redes sociales", fr: "réseaux sociaux" },
};

export type TipParams = { fields?: string[]; more?: boolean };

const TIPS: Record<string, Texts> = {
  addSocial: { en: "Add a social media link so employers can see more of your work.", es: "Añade un enlace a tus redes sociales para que los empleadores vean más de tu trabajo.", fr: "Ajoutez un lien vers vos réseaux sociaux pour que les employeurs voient davantage de votre travail." },
  addExperience: { en: "Add your work experience (clubs, roles and dates).", es: "Añade tu experiencia laboral (clubes, puestos y fechas).", fr: "Ajoutez votre expérience professionnelle (clubs, postes et dates)." },
  addMoreExperience: { en: "Add one more role and describe what you did and achieved in each.", es: "Añade un puesto más y describe lo que hiciste y lograste en cada uno.", fr: "Ajoutez un poste de plus et décrivez ce que vous avez fait et accompli dans chacun." },
  addEducation: { en: "Add your education.", es: "Añade tu formación.", fr: "Ajoutez votre formation." },
  addLicenses: { en: "Add your coaching licences and certifications.", es: "Añade tus licencias y certificaciones de entrenador.", fr: "Ajoutez vos licences et certifications d'entraîneur." },
  identityWaiting: { en: "Your identity check is waiting for review.", es: "Tu verificación de identidad está pendiente de revisión.", fr: "Votre vérification d'identité est en attente d'examen." },
  identityRequest: { en: "Request identity verification from your profile.", es: "Solicita la verificación de identidad desde tu perfil.", fr: "Demandez la vérification de votre identité depuis votre profil." },
  credentialsWaiting: { en: "Your qualification documents are waiting for review.", es: "Tus documentos de cualificación están pendientes de revisión.", fr: "Vos documents de qualification sont en attente d'examen." },
  credentialsUpload: { en: "Upload a document for your latest licence or qualification so it can be verified.", es: "Sube un documento de tu última licencia o cualificación para que se pueda verificar.", fr: "Téléversez un document pour votre dernière licence ou qualification afin qu'elle puisse être vérifiée." },
  workHistoryWaiting: { en: "Your work history document is waiting for review.", es: "Tu documento de historial laboral está pendiente de revisión.", fr: "Votre document de parcours professionnel est en attente d'examen." },
  workHistoryUpload: { en: "Upload a document that confirms one of your roles (contract, letter or club page).", es: "Sube un documento que confirme uno de tus puestos (contrato, carta o página del club).", fr: "Téléversez un document qui confirme l'un de vos postes (contrat, lettre ou page du club)." },
  addPhoto: { en: "Add a clear profile photo.", es: "Añade una foto de perfil clara.", fr: "Ajoutez une photo de profil nette." },
  updateCv: { en: "Update your CV so it matches your role.", es: "Actualiza tu CV para que se ajuste a tu puesto.", fr: "Mettez à jour votre CV pour qu'il corresponde à votre poste." },
  uploadCv: { en: "Upload your CV.", es: "Sube tu CV.", fr: "Téléversez votre CV." },
  recordInterview: { en: "Record your video interview.", es: "Graba tu entrevista en vídeo.", fr: "Enregistrez votre entretien vidéo." },
  addMethodology: { en: "Optional: add a methodology video to stand out to employers.", es: "Opcional: añade un vídeo de metodología para destacar ante los empleadores.", fr: "Facultatif : ajoutez une vidéo de méthodologie pour vous démarquer auprès des employeurs." },
  updateAvailability: { en: "Update your availability.", es: "Actualiza tu disponibilidad.", fr: "Mettez à jour votre disponibilité." },
  reviewProfile: { en: "Review your profile. It has not been updated for a while.", es: "Revisa tu perfil. Hace tiempo que no se actualiza.", fr: "Relisez votre profil. Il n'a pas été mis à jour depuis un moment." },
  replyMessages: { en: "Reply to the messages you receive from employers.", es: "Responde a los mensajes que recibes de los empleadores.", fr: "Répondez aux messages que vous recevez des employeurs." },
  addPhoneSocial: { en: "Add your phone number and social media.", es: "Añade tu número de teléfono y tus redes sociales.", fr: "Ajoutez votre numéro de téléphone et vos réseaux sociaux." },
  addClubs: { en: "Add the clubs you have played for.", es: "Añade los clubes en los que has jugado.", fr: "Ajoutez les clubs dans lesquels vous avez joué." },
  clubHistoryWaiting: { en: "Your club history document is waiting for review.", es: "Tu documento de historial de clubes está pendiente de revisión.", fr: "Votre document d'historique des clubs est en attente d'examen." },
  clubHistoryUpload: { en: "Upload a document that confirms one of your clubs (contract or club page).", es: "Sube un documento que confirme uno de tus clubes (contrato o página del club).", fr: "Téléversez un document qui confirme l'un de vos clubs (contrat ou page du club)." },
  uploadHighlights: { en: "Upload your two highlight videos.", es: "Sube tus dos vídeos de mejores jugadas.", fr: "Téléversez vos deux vidéos de meilleurs moments." },
};

const pick = (texts: Texts | undefined, lang: AiLang): string | undefined => texts?.[lang] ?? texts?.en;
const fieldLabel = (field: string, lang: AiLang): string => pick(FIELD_LABELS[field], lang) ?? field;

/** Tip text for a key (with params for the "add your ..." tip) in the given language. */
export const renderTip = (tipKey: string, params: TipParams | undefined, lang: AiLang = "en"): string | undefined => {
  if (tipKey === "addMissingFields") {
    const fields = (params?.fields ?? []).map((field) => fieldLabel(field, lang));
    if (!fields.length) return undefined;
    const list = fields.join(", ");
    const more = !!params?.more;
    if (lang === "es") return `Añade: ${list}${more ? " y más" : ""}.`;
    if (lang === "fr") return `Complétez : ${list}${more ? " et plus" : ""}.`;
    return `Add your ${list}${more ? " and more" : ""}.`;
  }
  return pick(TIPS[tipKey], lang);
};

export const itemLabel = (labelKey: string, lang: AiLang = "en"): string => pick(ITEM_LABELS[labelKey], lang) ?? labelKey;
export const categoryLabel = (key: TQualityCategory["key"], lang: AiLang = "en"): string => pick(CATEGORY_LABELS[key], lang) ?? key;
export const levelLabel = (level: TProfileLevel, lang: AiLang = "en"): string => pick(LEVEL_LABELS[level], lang) ?? level;
