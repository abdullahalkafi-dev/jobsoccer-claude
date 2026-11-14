import type { Lang } from "../../shared/i18n";

/**
 * Spanish and French versions of every sentence in video.config.ts. The key is the exact English
 * text used there. video.config.test.ts fails when a text of any plan has no entry here.
 * Spanish uses "tú", French uses "vous".
 */
const SHOWCASE_EN =
  "Showcase your professional approach, working methods, and expertise through a video that helps employers understand how you apply your knowledge in real-world situations.";
const STAFF_SESSION_EN =
  "Show one specialist session for your area: the objective, the setup, your coaching points, how you adapt it to different players, and how it connects to the team's game model.";

export const VIDEO_TEXTS: Record<Exclude<Lang, "en">, Record<string, string>> = {
  es: {
    // ---- methodology titles
    "Coaching Methodology Video": "Vídeo de metodología de entrenamiento",
    "Goalkeeper Coaching Methodology Video": "Vídeo de metodología de entrenamiento de porteros",
    "Mental Coaching Methodology Video": "Vídeo de metodología de coaching mental",
    "Video Analysis Methodology Video": "Vídeo de metodología de análisis de vídeo",
    "Training Methodology Video": "Vídeo de metodología de entrenamiento",
    "Scouting Methodology Video": "Vídeo de metodología de scouting",
    "Club Philosophy & Recruitment Methodology Video": "Vídeo de filosofía del club y metodología de captación",
    "Youth Development Methodology Video": "Vídeo de metodología de desarrollo juvenil",
    "Coaching Recruitment Methodology Video": "Vídeo de metodología de selección de entrenadores",
    "Professional Methodology Video": "Vídeo de metodología profesional",
    // ---- methodology headlines and details
    [SHOWCASE_EN]:
      "Muestra tu enfoque profesional, tus métodos de trabajo y tu experiencia en un vídeo que ayude a los empleadores a entender cómo aplicas tus conocimientos en situaciones reales.",
    "Showcase your coaching philosophy, playing style, and approach to team management. Demonstrate how you plan and organize training sessions, implement tactical strategies, and develop players to achieve individual and team objectives.":
      "Muestra tu filosofía de entrenamiento, tu estilo de juego y tu forma de dirigir al equipo. Explica cómo planificas y organizas los entrenamientos, aplicas estrategias tácticas y desarrollas a los jugadores para alcanzar los objetivos individuales y del equipo.",
    "Showcase your approach to supporting the Head Coach during training sessions and matches. Demonstrate how you assist with organizing drills, providing player feedback, and contributing to individual and team development.":
      "Muestra cómo apoyas al entrenador principal durante los entrenamientos y los partidos. Explica cómo ayudas a organizar los ejercicios, das feedback a los jugadores y contribuyes al desarrollo individual y del equipo.",
    "Show one goalkeeper session: the objective, the exercises, your coaching points, and how you link it to the team's game model and to match situations.":
      "Muestra una sesión de porteros: el objetivo, los ejercicios, tus puntos de coaching y cómo la vinculas con el modelo de juego del equipo y con situaciones de partido.",
    "Explain how you work with a player or team: how you identify needs, the tools you use, how you measure progress, and how you protect privacy and wellbeing. No real names or medical details.":
      "Explica cómo trabajas con un jugador o un equipo: cómo identificas las necesidades, las herramientas que usas, cómo mides el progreso y cómo proteges la privacidad y el bienestar. Sin nombres reales ni datos médicos.",
    "Show a short example of your analysis: what you code and why, how you select clips, and how you present findings to coaches and players in a useful way.":
      "Muestra un breve ejemplo de tu análisis: qué etiquetas y por qué, cómo seleccionas los clips y cómo presentas las conclusiones a entrenadores y jugadores de forma útil.",
    "Demonstrate your coaching methods, practical exercises, and how you help players improve their performance.":
      "Muestra tus métodos de entrenamiento, tus ejercicios prácticos y cómo ayudas a los jugadores a mejorar su rendimiento.",
    [STAFF_SESSION_EN]:
      "Muestra una sesión especializada de tu área: el objetivo, la organización, tus puntos de coaching, cómo la adaptas a distintos jugadores y cómo se conecta con el modelo de juego del equipo.",
    "Showcase your approach to identifying, observing, and evaluating players. Demonstrate your scouting criteria, analysis methods, and how you assess player potential and suitability for a club's playing philosophy and recruitment objectives.":
      "Muestra tu forma de identificar, observar y evaluar jugadores. Explica tus criterios de scouting, tus métodos de análisis y cómo valoras el potencial de un jugador y su encaje con la filosofía de juego y los objetivos de fichaje de un club.",
    "Explain your scouting process from start to finish: how you find players, what you assess, how many times you watch them, how you write a report, and how you make a recommendation. A sample report (without real names) is welcome.":
      "Explica tu proceso de scouting de principio a fin: cómo encuentras jugadores, qué evalúas, cuántas veces los ves, cómo redactas un informe y cómo haces una recomendación. Se agradece un informe de ejemplo (sin nombres reales).",
    "Showcase your approach to defining and implementing a club's football philosophy, playing style, and technical methodology, and to identifying, evaluating, and recruiting players. Demonstrate how you align coaching staff, player development, recruitment, and team performance with the club's long-term vision.":
      "Muestra cómo defines e implementas la filosofía futbolística, el estilo de juego y la metodología técnica de un club, y cómo identificas, evalúas y fichas jugadores. Explica cómo alineas al cuerpo técnico, el desarrollo de jugadores, la captación y el rendimiento del equipo con la visión a largo plazo del club.",
    "Present the club philosophy you would build or have built: playing identity, development pathway, and how coaches across all teams apply it. Then explain how you recruit players: identifying needs, the scouting process, criteria, decision-making with staff, and how you judge whether a signing worked.":
      "Presenta la filosofía de club que construirías o que has construido: identidad de juego, itinerario de desarrollo y cómo la aplican los entrenadores de todos los equipos. Después explica cómo fichas jugadores: identificación de necesidades, proceso de scouting, criterios, toma de decisiones con el staff y cómo valoras si un fichaje ha funcionado.",
    "Showcase your approach to structuring and managing youth development programs. Demonstrate your methodology for player progression, coach development, and building a consistent development pathway across all age groups.":
      "Muestra cómo estructuras y diriges programas de desarrollo juvenil. Explica tu metodología para la progresión de los jugadores, la formación de entrenadores y la construcción de un itinerario de desarrollo coherente en todas las categorías.",
    "Present your youth development model: the age-group pathway, priorities at each stage, how you track progress, player welfare and safeguarding, and how players move up to the first team.":
      "Presenta tu modelo de desarrollo juvenil: el itinerario por categorías, las prioridades en cada etapa, cómo haces el seguimiento del progreso, el bienestar y la protección de los jugadores y cómo suben al primer equipo.",
    "Showcase your approach to identifying, evaluating, and recruiting coaches. Demonstrate your selection criteria, assessment methods, and how you ensure coaches align with the club's philosophy and development objectives.":
      "Muestra cómo identificas, evalúas y contratas entrenadores. Explica tus criterios de selección, tus métodos de evaluación y cómo garantizas que los entrenadores se alinean con la filosofía y los objetivos de desarrollo del club.",
    "Explain how you recruit and develop coaches: the profile you look for, the selection process, how you check qualifications and safeguarding, and how you support and evaluate coaches once hired.":
      "Explica cómo seleccionas y desarrollas a los entrenadores: el perfil que buscas, el proceso de selección, cómo compruebas las titulaciones y la protección de menores y cómo apoyas y evalúas a los entrenadores una vez contratados.",
    "Show how you work in your role using one real example: a project, campaign, event or process. Explain the goal, the steps you took, the tools you used, and the result.":
      "Muestra cómo trabajas en tu puesto con un ejemplo real: un proyecto, una campaña, un evento o un proceso. Explica el objetivo, los pasos que seguiste, las herramientas que usaste y el resultado.",
    // ---- recording position
    "Recording position": "Posición de grabación",
    "Sit on a chair or sofa, or stand, away from any desk, table, or computer screen.":
      "Siéntate en una silla o sofá, o ponte de pie, lejos de cualquier escritorio, mesa o pantalla de ordenador.",
    "Place the camera far enough away to show you from head to at least the knees, with your face clearly visible and your hands in view.":
      "Coloca la cámara lo bastante lejos para que se te vea de la cabeza a las rodillas como mínimo, con la cara bien visible y las manos a la vista.",
    "Look at the camera while answering.": "Mira a la cámara mientras respondes.",
    "No notes, screens, or devices in front of you during the recording.":
      "Sin notas, pantallas ni dispositivos delante de ti durante la grabación.",
    "Candidates who need an adjustment for accessibility reasons can contact JOBSOCCER support.":
      "Los candidatos que necesiten un ajuste por motivos de accesibilidad pueden contactar con el soporte de JOBSOCCER.",
    // ---- interview
    "Video Interview": "Entrevista en vídeo",
    "This video allows employers to learn about you and understand your methodology before moving to the next stage of the recruitment process. Duration: up to 6:30 minutes in total.":
      "Este vídeo permite a los empleadores conocerte y entender tu metodología antes de pasar a la siguiente fase del proceso de selección. Duración: hasta 6:30 minutos en total.",
    "Introduce yourself at the start": "Preséntate al principio",
    "Full name": "Nombre completo",
    "Country": "País",
    "Position applying for": "Posición a la que te postulas",
    "Current club or coaching role (if applicable)": "Club actual o puesto de entrenador (si procede)",
    "Current role or organization (if applicable)": "Puesto u organización actual (si procede)",
    "Answer the interview questions": "Responde a las preguntas de la entrevista",
    "Answer the questions shown for your position, in the order they appear.":
      "Responde a las preguntas que se muestran para tu posición, en el orden en que aparecen.",
    "You may skip a question. A skipped question is shown as 'Not Answered' and gets 0 points.":
      "Puedes saltarte una pregunta. Una pregunta omitida aparece como «Sin responder» y obtiene 0 puntos.",
    "All candidates for the same position answer the same questions, so every candidate is evaluated on equal terms.":
      "Todos los candidatos de la misma posición responden a las mismas preguntas, de modo que todos son evaluados en igualdad de condiciones.",
    "Answer in your own words. Reading directly from a script is not allowed.":
      "Responde con tus propias palabras. No está permitido leer directamente de un guion.",
    "Recording instructions": "Instrucciones de grabación",
    "You may pause and record your answers separately, then combine all answers into one video before uploading.":
      "Puedes hacer pausas y grabar tus respuestas por separado, y luego unirlas en un solo vídeo antes de subirlo.",
    "The questions must be clearly displayed in the video, in the order they appear.":
      "Las preguntas deben mostrarse claramente en el vídeo, en el orden en que aparecen.",
    "Your final video must be up to 6:30 minutes in total.": "Tu vídeo final debe durar un máximo de 6:30 minutos en total.",
    // ---- technical
    "Technical requirements (all videos)": "Requisitos técnicos (todos los vídeos)",
    "Record using a phone, tablet, or laptop. Landscape or portrait format accepted.":
      "Graba con un teléfono, una tableta o un portátil. Se acepta formato horizontal o vertical.",
    "Fixed camera only (no handheld or walking shots).": "Solo cámara fija (sin planos a pulso ni caminando).",
    "Good lighting and clear sound. Use a mini microphone (wireless or clip-on) connected to your phone, so your voice is clear from a distance.":
      "Buena iluminación y sonido claro. Usa un micrófono pequeño (inalámbrico o de solapa) conectado a tu teléfono para que tu voz se oiga bien a distancia.",
    "Quiet location: avoid wind, noise, and music.": "Lugar tranquilo: evita el viento, el ruido y la música.",
    "Speak in one language only, matching the role or market. English subtitles are created automatically.":
      "Habla en un solo idioma, acorde con el puesto o el mercado. Los subtítulos en inglés se crean automáticamente.",
    "Accepted formats: MP4 or MOV. Minimum quality: 720p. Maximum file size: 600 MB per video.":
      "Formatos aceptados: MP4 o MOV. Calidad mínima: 720p. Tamaño máximo: 600 MB por vídeo.",
    // ---- consent / lock
    "Your video answers are transcribed, summarized, and scored by AI to help employers review them. Scores support, never replace, the employer's judgment. I give my consent.":
      "Las respuestas de tu vídeo se transcriben, se resumen y se puntúan con IA para ayudar a los empleadores a revisarlas. Las puntuaciones apoyan, pero nunca sustituyen, el criterio del empleador. Doy mi consentimiento.",
    "You must have permission from your club and from the players shown in your video to share the footage. For players under 18, permission must come from their parents or legal guardians. I confirm I have this permission.":
      "Debes tener permiso de tu club y de los jugadores que aparecen en tu vídeo para compartir las imágenes. En el caso de menores de 18 años, el permiso debe darlo su padre, madre o tutor legal. Confirmo que tengo este permiso.",
    "Your Video Interview and Methodology Video are locked for 3 months after submission. After this period you may upload an updated version. Each new submission starts a new 3-month lock period.":
      "Tu entrevista en vídeo y tu vídeo de metodología quedan bloqueados durante 3 meses tras enviarlos. Pasado ese tiempo podrás subir una versión actualizada. Cada nuevo envío inicia un nuevo periodo de bloqueo de 3 meses.",
    // ---- methodology content
    "What to show": "Qué mostrar",
    "Content requirements": "Requisitos del contenido",
    "Explain your working methodology: how you organize your work, make decisions, and measure results in your role.":
      "Explica tu metodología de trabajo: cómo organizas tu trabajo, tomas decisiones y mides los resultados en tu puesto.",
    "Speak clearly so employers can follow your process and logic.":
      "Habla con claridad para que los empleadores puedan seguir tu proceso y tu razonamiento.",
    "Profiles that include this video stand out to employers.": "Los perfiles que incluyen este vídeo destacan ante los empleadores.",
    "The footage must be clear enough to evaluate your methodology.":
      "Las imágenes deben ser lo bastante claras para poder evaluar tu metodología.",
    "Not allowed": "No permitido",
    "Music overlays": "Música superpuesta",
    "Highlight compilations, edits, or montages": "Recopilaciones de jugadas, ediciones o montajes",
    "Voice-over added after recording": "Voz en off añadida después de la grabación",
    "Confidential information from a current or former employer (contracts, player data, internal documents)":
      "Información confidencial de un empleador actual o anterior (contratos, datos de jugadores, documentos internos)",
    "Highlight montages or edited sequences": "Montajes de jugadas o secuencias editadas",
    " (optional)": " (opcional)",
    // ---- highlights
    "Highlights": "Resumen de jugadas",
    "Upload 2 highlight videos, up to 3 minutes each, that show you at your best.":
      "Sube 2 vídeos de jugadas destacadas, de hasta 3 minutos cada uno, que te muestren en tu mejor nivel.",
    "Tips": "Consejos",
    "Show real match or training footage where you can be seen clearly.":
      "Muestra imágenes reales de partidos o entrenamientos en las que se te vea con claridad.",
    "Keep each video focused and under 3 minutes.": "Mantén cada vídeo centrado y de menos de 3 minutos.",
    "Only show other players (especially under-18s) if you have their or their parents' permission.":
      "Muestra a otros jugadores (sobre todo menores de 18 años) solo si tienes su permiso o el de sus padres.",
    // ---- file name hints
    "Firstname-Lastname-Position-Date (YYYY-MM-DD, example: John-Smith-Midfielder-2026-02-10)":
      "Nombre-Apellido-Posición-Fecha (AAAA-MM-DD, ejemplo: John-Smith-Centrocampista-2026-02-10)",
    "Firstname-Lastname-Position-Date (YYYY-MM-DD, example: John-Smith-U15HeadCoach-2026-02-10)":
      "Nombre-Apellido-Posición-Fecha (AAAA-MM-DD, ejemplo: John-Smith-EntrenadorU15-2026-02-10)",
    "Firstname-Lastname-Position-Date (YYYY-MM-DD, example: Jane-Doe-OperationsManager-2026-10-15)":
      "Nombre-Apellido-Posición-Fecha (AAAA-MM-DD, ejemplo: Jane-Doe-ResponsableDeOperaciones-2026-10-15)",
  },
  fr: {
    "Coaching Methodology Video": "Vidéo de méthodologie d'entraînement",
    "Goalkeeper Coaching Methodology Video": "Vidéo de méthodologie d'entraînement des gardiens",
    "Mental Coaching Methodology Video": "Vidéo de méthodologie de coaching mental",
    "Video Analysis Methodology Video": "Vidéo de méthodologie d'analyse vidéo",
    "Training Methodology Video": "Vidéo de méthodologie d'entraînement",
    "Scouting Methodology Video": "Vidéo de méthodologie de recrutement sportif (scouting)",
    "Club Philosophy & Recruitment Methodology Video": "Vidéo de philosophie du club et de méthodologie de recrutement",
    "Youth Development Methodology Video": "Vidéo de méthodologie de développement des jeunes",
    "Coaching Recruitment Methodology Video": "Vidéo de méthodologie de recrutement des entraîneurs",
    "Professional Methodology Video": "Vidéo de méthodologie professionnelle",
    [SHOWCASE_EN]:
      "Présentez votre approche professionnelle, vos méthodes de travail et votre expertise dans une vidéo qui aide les employeurs à comprendre comment vous appliquez vos connaissances dans des situations réelles.",
    "Showcase your coaching philosophy, playing style, and approach to team management. Demonstrate how you plan and organize training sessions, implement tactical strategies, and develop players to achieve individual and team objectives.":
      "Présentez votre philosophie d'entraînement, votre style de jeu et votre approche de la gestion d'équipe. Montrez comment vous planifiez et organisez les séances, mettez en œuvre des stratégies tactiques et faites progresser les joueurs pour atteindre les objectifs individuels et collectifs.",
    "Showcase your approach to supporting the Head Coach during training sessions and matches. Demonstrate how you assist with organizing drills, providing player feedback, and contributing to individual and team development.":
      "Présentez votre manière de soutenir l'entraîneur principal pendant les séances et les matchs. Montrez comment vous aidez à organiser les exercices, donnez du retour aux joueurs et contribuez au développement individuel et collectif.",
    "Show one goalkeeper session: the objective, the exercises, your coaching points, and how you link it to the team's game model and to match situations.":
      "Présentez une séance de gardiens : l'objectif, les exercices, vos points de coaching et le lien avec le modèle de jeu de l'équipe et les situations de match.",
    "Explain how you work with a player or team: how you identify needs, the tools you use, how you measure progress, and how you protect privacy and wellbeing. No real names or medical details.":
      "Expliquez comment vous travaillez avec un joueur ou une équipe : comment vous identifiez les besoins, les outils que vous utilisez, comment vous mesurez les progrès et comment vous protégez la vie privée et le bien-être. Pas de noms réels ni de détails médicaux.",
    "Show a short example of your analysis: what you code and why, how you select clips, and how you present findings to coaches and players in a useful way.":
      "Présentez un court exemple de votre analyse : ce que vous codez et pourquoi, comment vous sélectionnez les séquences et comment vous présentez vos conclusions aux entraîneurs et aux joueurs de façon utile.",
    "Demonstrate your coaching methods, practical exercises, and how you help players improve their performance.":
      "Présentez vos méthodes d'entraînement, vos exercices pratiques et la façon dont vous aidez les joueurs à améliorer leurs performances.",
    [STAFF_SESSION_EN]:
      "Présentez une séance spécialisée dans votre domaine : l'objectif, l'organisation, vos points de coaching, la manière dont vous l'adaptez à différents joueurs et son lien avec le modèle de jeu de l'équipe.",
    "Showcase your approach to identifying, observing, and evaluating players. Demonstrate your scouting criteria, analysis methods, and how you assess player potential and suitability for a club's playing philosophy and recruitment objectives.":
      "Présentez votre approche pour repérer, observer et évaluer les joueurs. Montrez vos critères de scouting, vos méthodes d'analyse et la façon dont vous évaluez le potentiel d'un joueur et son adéquation avec la philosophie de jeu et les objectifs de recrutement d'un club.",
    "Explain your scouting process from start to finish: how you find players, what you assess, how many times you watch them, how you write a report, and how you make a recommendation. A sample report (without real names) is welcome.":
      "Expliquez votre processus de scouting du début à la fin : comment vous trouvez des joueurs, ce que vous évaluez, combien de fois vous les observez, comment vous rédigez un rapport et comment vous formulez une recommandation. Un exemple de rapport (sans noms réels) est bienvenu.",
    "Showcase your approach to defining and implementing a club's football philosophy, playing style, and technical methodology, and to identifying, evaluating, and recruiting players. Demonstrate how you align coaching staff, player development, recruitment, and team performance with the club's long-term vision.":
      "Présentez votre approche pour définir et mettre en œuvre la philosophie de football, le style de jeu et la méthodologie technique d'un club, ainsi que pour repérer, évaluer et recruter des joueurs. Montrez comment vous alignez le staff technique, la formation des joueurs, le recrutement et la performance de l'équipe sur la vision à long terme du club.",
    "Present the club philosophy you would build or have built: playing identity, development pathway, and how coaches across all teams apply it. Then explain how you recruit players: identifying needs, the scouting process, criteria, decision-making with staff, and how you judge whether a signing worked.":
      "Présentez la philosophie de club que vous construiriez ou avez construite : identité de jeu, parcours de formation et application par les entraîneurs de toutes les équipes. Expliquez ensuite comment vous recrutez les joueurs : identification des besoins, processus de scouting, critères, prise de décision avec le staff et manière d'évaluer la réussite d'un recrutement.",
    "Showcase your approach to structuring and managing youth development programs. Demonstrate your methodology for player progression, coach development, and building a consistent development pathway across all age groups.":
      "Présentez votre approche pour structurer et diriger des programmes de formation des jeunes. Montrez votre méthodologie pour la progression des joueurs, la formation des entraîneurs et la construction d'un parcours de formation cohérent dans toutes les catégories d'âge.",
    "Present your youth development model: the age-group pathway, priorities at each stage, how you track progress, player welfare and safeguarding, and how players move up to the first team.":
      "Présentez votre modèle de formation des jeunes : le parcours par catégories d'âge, les priorités à chaque étape, le suivi des progrès, le bien-être et la protection des joueurs, et le passage vers l'équipe première.",
    "Showcase your approach to identifying, evaluating, and recruiting coaches. Demonstrate your selection criteria, assessment methods, and how you ensure coaches align with the club's philosophy and development objectives.":
      "Présentez votre approche pour repérer, évaluer et recruter des entraîneurs. Montrez vos critères de sélection, vos méthodes d'évaluation et la façon dont vous vous assurez que les entraîneurs adhèrent à la philosophie et aux objectifs de développement du club.",
    "Explain how you recruit and develop coaches: the profile you look for, the selection process, how you check qualifications and safeguarding, and how you support and evaluate coaches once hired.":
      "Expliquez comment vous recrutez et faites progresser les entraîneurs : le profil recherché, le processus de sélection, la vérification des diplômes et de la protection des mineurs, et le soutien et l'évaluation des entraîneurs une fois recrutés.",
    "Show how you work in your role using one real example: a project, campaign, event or process. Explain the goal, the steps you took, the tools you used, and the result.":
      "Montrez comment vous travaillez dans votre poste à l'aide d'un exemple réel : un projet, une campagne, un événement ou un processus. Expliquez l'objectif, les étapes suivies, les outils utilisés et le résultat.",
    "Recording position": "Position d'enregistrement",
    "Sit on a chair or sofa, or stand, away from any desk, table, or computer screen.":
      "Asseyez-vous sur une chaise ou un canapé, ou tenez-vous debout, loin de tout bureau, table ou écran d'ordinateur.",
    "Place the camera far enough away to show you from head to at least the knees, with your face clearly visible and your hands in view.":
      "Placez la caméra assez loin pour vous montrer de la tête aux genoux au minimum, avec le visage bien visible et les mains dans le champ.",
    "Look at the camera while answering.": "Regardez la caméra pendant vos réponses.",
    "No notes, screens, or devices in front of you during the recording.":
      "Pas de notes, d'écrans ni d'appareils devant vous pendant l'enregistrement.",
    "Candidates who need an adjustment for accessibility reasons can contact JOBSOCCER support.":
      "Les candidats qui ont besoin d'un aménagement pour des raisons d'accessibilité peuvent contacter le support JOBSOCCER.",
    "Video Interview": "Entretien vidéo",
    "This video allows employers to learn about you and understand your methodology before moving to the next stage of the recruitment process. Duration: up to 6:30 minutes in total.":
      "Cette vidéo permet aux employeurs de vous connaître et de comprendre votre méthodologie avant de passer à l'étape suivante du processus de recrutement. Durée : 6 min 30 au maximum au total.",
    "Introduce yourself at the start": "Présentez-vous au début",
    "Full name": "Nom complet",
    "Country": "Pays",
    "Position applying for": "Poste visé",
    "Current club or coaching role (if applicable)": "Club actuel ou fonction d'entraîneur (le cas échéant)",
    "Current role or organization (if applicable)": "Fonction ou organisation actuelle (le cas échéant)",
    "Answer the interview questions": "Répondez aux questions de l'entretien",
    "Answer the questions shown for your position, in the order they appear.":
      "Répondez aux questions affichées pour votre poste, dans l'ordre où elles apparaissent.",
    "You may skip a question. A skipped question is shown as 'Not Answered' and gets 0 points.":
      "Vous pouvez passer une question. Une question passée est indiquée « Sans réponse » et obtient 0 point.",
    "All candidates for the same position answer the same questions, so every candidate is evaluated on equal terms.":
      "Tous les candidats d'un même poste répondent aux mêmes questions, afin que chacun soit évalué dans les mêmes conditions.",
    "Answer in your own words. Reading directly from a script is not allowed.":
      "Répondez avec vos propres mots. Il n'est pas permis de lire directement un texte.",
    "Recording instructions": "Consignes d'enregistrement",
    "You may pause and record your answers separately, then combine all answers into one video before uploading.":
      "Vous pouvez faire des pauses et enregistrer vos réponses séparément, puis les regrouper en une seule vidéo avant de la téléverser.",
    "The questions must be clearly displayed in the video, in the order they appear.":
      "Les questions doivent être clairement affichées dans la vidéo, dans l'ordre où elles apparaissent.",
    "Your final video must be up to 6:30 minutes in total.": "Votre vidéo finale doit durer 6 min 30 au maximum au total.",
    "Technical requirements (all videos)": "Exigences techniques (toutes les vidéos)",
    "Record using a phone, tablet, or laptop. Landscape or portrait format accepted.":
      "Enregistrez avec un téléphone, une tablette ou un ordinateur portable. Les formats paysage et portrait sont acceptés.",
    "Fixed camera only (no handheld or walking shots).": "Caméra fixe uniquement (pas de plans à la main ni en marchant).",
    "Good lighting and clear sound. Use a mini microphone (wireless or clip-on) connected to your phone, so your voice is clear from a distance.":
      "Bon éclairage et son clair. Utilisez un petit microphone (sans fil ou cravate) relié à votre téléphone pour que votre voix soit nette à distance.",
    "Quiet location: avoid wind, noise, and music.": "Lieu calme : évitez le vent, le bruit et la musique.",
    "Speak in one language only, matching the role or market. English subtitles are created automatically.":
      "Parlez dans une seule langue, adaptée au poste ou au marché. Les sous-titres en anglais sont créés automatiquement.",
    "Accepted formats: MP4 or MOV. Minimum quality: 720p. Maximum file size: 600 MB per video.":
      "Formats acceptés : MP4 ou MOV. Qualité minimale : 720p. Taille maximale : 600 Mo par vidéo.",
    "Your video answers are transcribed, summarized, and scored by AI to help employers review them. Scores support, never replace, the employer's judgment. I give my consent.":
      "Les réponses de votre vidéo sont transcrites, résumées et notées par une IA afin d'aider les employeurs à les examiner. Les notes appuient, sans jamais remplacer, le jugement de l'employeur. Je donne mon consentement.",
    "You must have permission from your club and from the players shown in your video to share the footage. For players under 18, permission must come from their parents or legal guardians. I confirm I have this permission.":
      "Vous devez avoir l'autorisation de votre club et des joueurs visibles dans votre vidéo pour partager les images. Pour les joueurs de moins de 18 ans, l'autorisation doit venir de leurs parents ou représentants légaux. Je confirme avoir cette autorisation.",
    "Your Video Interview and Methodology Video are locked for 3 months after submission. After this period you may upload an updated version. Each new submission starts a new 3-month lock period.":
      "Votre entretien vidéo et votre vidéo de méthodologie sont verrouillés pendant 3 mois après leur envoi. Passé ce délai, vous pourrez téléverser une version mise à jour. Chaque nouvel envoi démarre une nouvelle période de verrouillage de 3 mois.",
    "What to show": "Ce qu'il faut montrer",
    "Content requirements": "Exigences relatives au contenu",
    "Explain your working methodology: how you organize your work, make decisions, and measure results in your role.":
      "Expliquez votre méthodologie de travail : comment vous organisez votre travail, prenez des décisions et mesurez les résultats dans votre poste.",
    "Speak clearly so employers can follow your process and logic.":
      "Parlez clairement afin que les employeurs puissent suivre votre démarche et votre raisonnement.",
    "Profiles that include this video stand out to employers.": "Les profils qui comportent cette vidéo se démarquent auprès des employeurs.",
    "The footage must be clear enough to evaluate your methodology.":
      "Les images doivent être assez claires pour évaluer votre méthodologie.",
    "Not allowed": "Non autorisé",
    "Music overlays": "Musique ajoutée par-dessus",
    "Highlight compilations, edits, or montages": "Compilations d'actions, montages ou vidéos éditées",
    "Voice-over added after recording": "Voix off ajoutée après l'enregistrement",
    "Confidential information from a current or former employer (contracts, player data, internal documents)":
      "Informations confidentielles d'un employeur actuel ou ancien (contrats, données de joueurs, documents internes)",
    "Highlight montages or edited sequences": "Montages d'actions ou séquences éditées",
    " (optional)": " (facultatif)",
    "Highlights": "Temps forts",
    "Upload 2 highlight videos, up to 3 minutes each, that show you at your best.":
      "Téléversez 2 vidéos de temps forts, de 3 minutes maximum chacune, qui vous montrent à votre meilleur niveau.",
    "Tips": "Conseils",
    "Show real match or training footage where you can be seen clearly.":
      "Montrez des images réelles de matchs ou d'entraînements où l'on vous voit clairement.",
    "Keep each video focused and under 3 minutes.": "Gardez chaque vidéo ciblée et de moins de 3 minutes.",
    "Only show other players (especially under-18s) if you have their or their parents' permission.":
      "Ne montrez d'autres joueurs (surtout de moins de 18 ans) que si vous avez leur autorisation ou celle de leurs parents.",
    "Firstname-Lastname-Position-Date (YYYY-MM-DD, example: John-Smith-Midfielder-2026-02-10)":
      "Prenom-Nom-Poste-Date (AAAA-MM-JJ, exemple : John-Smith-Milieu-2026-02-10)",
    "Firstname-Lastname-Position-Date (YYYY-MM-DD, example: John-Smith-U15HeadCoach-2026-02-10)":
      "Prenom-Nom-Poste-Date (AAAA-MM-JJ, exemple : John-Smith-EntraineurU15-2026-02-10)",
    "Firstname-Lastname-Position-Date (YYYY-MM-DD, example: Jane-Doe-OperationsManager-2026-10-15)":
      "Prenom-Nom-Poste-Date (AAAA-MM-JJ, exemple : Jane-Doe-ResponsableDesOperations-2026-10-15)",
  },
};
