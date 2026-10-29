import { Persona, RoleScenario } from "./types";

/**
 * Head Coach (Amateur) - five fake candidates written from the client's scoring guide
 * (on_field_staff.head_coach.amateur.v1). Answers are NOT taken from the AI's output.
 *
 *  bad         vague, only results and authority      -> expected: very low
 *  weak        general ideas, no real examples        -> expected: low
 *  good        sound approach, some real examples     -> expected: mid to good
 *  best        specific, real situation+action+outcome-> expected: strong
 *  incomplete  good answers for Q1-9, then runs out   -> expected: Q10-18 "Not Answered", no level
 */

const bad: (string | null)[] = [
  "I played football for many years so I know the game very well. I am passionate about football.",
  "My mission is to win. Winning is everything, otherwise there is no point in coaching.",
  "I measure it by the league position. If we win I did well and if we lose I did badly.",
  "If we win then the tactical plan worked. The players must just obey and run hard.",
  "I tell them what to do and they have to do it. If they don't, they sit on the bench.",
  "I don't really use video. When someone makes a mistake I show everybody so he feels it.",
  "We do some drills and a lot of fitness work. Fitness is the most important thing in football.",
  "Passion, discipline and hard work. Football is about heart.",
  "I explain it again, louder. If they still can't do it then they are simply not good enough.",
  "I show them who the boss is from the first day. Players respect a strong coach.",
  "I don't have conflicts. The players do what I say or they leave the club.",
  "After a loss I tell them straight away what they did wrong, in front of everybody.",
  "I normally don't change the plan. Sometimes I change the formation, I don't know, just to try something.",
  "I give a big speech and tell them to try harder.",
  "I don't see any differences. Players are players. I talk and they listen.",
  "Loyalty and winning. The players who are loyal to me play.",
  "I never really failed. Normally it was the referee or the players who made the mistakes.",
  "I pick people I know, my friends. People who don't argue with me.",
];

const weak: (string | null)[] = [
  "I played at a good amateur level and then started coaching youth teams. That taught me a lot about working with players.",
  "I want players to improve and enjoy football. Winning is nice but development is important too.",
  "I look at whether the team improves during the season and whether the players are happy.",
  "I look at whether the team is organized and whether the players follow the plan. The result matters as well.",
  "I watch the matches and see if they do what we practiced. If they do, then it transferred.",
  "I show some clips after matches, the good moments and the mistakes, and we talk about how to improve.",
  "We plan the week around the next match. Mostly we practice what we want to do on the weekend.",
  "We want to play good football and keep the ball. We remind them about the principles in training.",
  "I explain it again in a simple way and show it on the board, then we repeat it in training.",
  "I try to be fair and clear with the players and I treat everybody the same.",
  "I try to stay firm and talk with the player. I think it is important to keep the standards but stay calm.",
  "I encourage the players and tell them what was good, and we talk about what to improve next week.",
  "If the plan is not working I change something, like the formation or a player. I try to explain it at half-time.",
  "I stay positive and set small goals for the team so they keep believing.",
  "Every player is different so I adjust how I talk to each of them.",
  "Respect, honesty and hard work are important to me as a coach.",
  "Failure teaches you to analyze and prepare better next time. I try to learn from every defeat.",
  "I want assistants who are reliable and positive, and who get along well with the players.",
];

const good: (string | null)[] = [
  "I coached youth teams for six years and then took over an amateur senior side. A more experienced coach guided me and I have my UEFA B licence. Those years taught me to plan sessions properly.",
  "I want players to improve technically and tactically and to enjoy football in a safe environment. Winning matters but development comes first.",
  "I set goals for each player and for the team at the start of the season and check them regularly, together with attendance and how the players are progressing. Results matter too.",
  "I look at whether we follow our game model, how organized we are, the spacing and how we create chances. I use some video to see if a problem is execution or the plan.",
  "I decide what I want to see in matches, train it in game-like exercises and then watch whether it happens. If it doesn't, I adjust next week's training.",
  "I show a few clips connected to our objectives, positives first, then something to improve. I ask the players what they see and then we decide what to train.",
  "We define principles for our match model and plan the week and the sessions around them, with exercises that look like the match. After the match I adjust the plan.",
  "We build from the back, press as a team when we lose the ball and try to transition quickly. We repeat these in training and in video sessions.",
  "I simplify it into smaller steps, show it with demonstrations and ask questions to check they understood. Then I repeat the exercise in a simpler form.",
  "I explain my expectations on day one, listen to the players and I'm fair and consistent with everyone. I explain my decisions.",
  "At my last club a senior player kept arriving late. I spoke to him privately and explained that the standard applies to everyone, and I stayed calm.",
  "I usually let the emotions settle, so right after the game I keep the message short and without blame, and we analyze it properly the next day.",
  "Last season we were losing at half-time because the opponent was using long balls over our high line. I changed to a deeper block and explained it to the players.",
  "I keep the standards realistic, look for the reasons, set small goals the players can reach and keep the training positive.",
  "I explain, demonstrate and let them practice, and I give individual feedback to the ones who need it.",
  "Fairness, respect and honesty, and I always put the welfare of the players first.",
  "I once changed too many things before an important game and we lost. I took responsibility and now I change fewer things at a time.",
  "I want reliable and competent assistants who communicate well and are willing to challenge me when needed.",
];
const best: (string | null)[] = [
  "Three experiences shaped me. First, six years coaching youth teams, where I learned to plan every session around one clear objective. Second, a mentor, a former academy director, who taught me to separate playing experience from coaching competence, so I earned my UEFA B licence through courses and observation. Third, a relegation in my second season, which forced me to rebuild my methodology around a clear game model.",
  "My mission is complete player development, technical, tactical, physical and psychological, in a safe and inclusive environment where players enjoy the game and want to stay in it for years. I also build character, responsibility and teamwork. I balance that with competitive standards, because learning to compete is part of development.",
  "I measure success at two levels. For every player I set individual objectives and review them every six weeks. For the team I use observable indicators such as possession in build-up, pressing recoveries, attendance, retention and behavior. I share the results with the club board every quarter, linked to our club methodology.",
  "I start from our game model and match objectives, then check spacing, compactness, positioning and numerical relationships, progression, chance creation, defensive control and transitions. I use video and match data to separate execution problems from a flawed plan, for example a high press failing because of poor distances versus a wrong tactic.",
  "Each week I define observable behaviors, such as the pressing trigger on a back pass. I train them in realistic, game-related exercises and then track in matches, with video and staff notes, whether they appear under pressure. I also ask the players for feedback and adjust the next training week based on what we find.",
  "I select three or four clips linked to our objectives, start with positive actions, then one or two to improve. I ask the players to describe what they see first, and we convert the findings into next week's training objectives. I never use video to blame, I protect their dignity and I avoid overloading them with information.",
  "I define the principles of our match model, convert them into weekly and session objectives, and design realistic exercises such as small-sided games with pressing triggers. I link individual, unit and team work in the same week and adjust the next week's plan based on the match analysis.",
  "In possession we build from the back and create overloads. Out of possession we play a compact mid-block with pressing triggers. In transition we react within five seconds. I explain why these fit our players and reinforce them daily through coaching points, exercises and video reviews. The principles stay the same even when the formation changes from a 4-3-3 to a 3-4-3.",
  "I break a concept into smaller steps, demonstrate it with players, use visual aids and guided questions, and reduce the complexity of the exercise. I support individuals, units or the whole group depending on who struggles, and I check understanding by asking them to explain it back before we progress.",
  "In the first week I set clear expectations and standards and listen to each player individually. I'm fair and consistent, I explain my decisions, I show competence in sessions and I follow through on every commitment. I create psychological and physical safety so players can make mistakes and learn.",
  "At my last club our best player openly resisted the new pressing rules and started arriving late. I met him privately, explained the reasoning and that the standard applies to everyone, and kept my tone calm. I stayed firm and he started on the bench in the next match. Our pressing improved, he apologized and later became a leader. The lesson was to act early and always explain the why.",
  "First I judge whether talking immediately would be productive. Usually I give a short, balanced message with no blame, then allow a cooling-off period of twenty-four hours. After that I do an evidence-based analysis with video and discuss it. I protect the players' dignity while keeping accountability.",
  "Last season in a league match we were losing 1-0 at half-time because the opponent's long balls were exploiting our high line, which I noticed from the spacing between our defenders and midfielders. I dropped to a mid-block 4-4-2 and gave the players two simple instructions. We equalised and won 2-1. Honestly I should have anticipated it before the game, so now we prepare for that scenario.",
  "I keep the standards clear and realistic and diagnose the causes, such as fatigue, confidence or tactical problems. I set short-term, controllable objectives, adjust training without emotional reactions, and support confidence while keeping accountability. We track improvement every week.",
  "I use explanation, demonstration and practical repetition, ask questions to confirm understanding, give individual feedback where needed, and adjust my language and complexity per player, while the objectives and standards stay the same for everyone.",
  "Integrity, fairness, respect, accountability and safeguarding. They affect selection, discipline, communication and welfare. Once a sponsor pressured me to play his son. I refused, selected on merit, explained it to the parents, and the club board supported the decision. I also respect confidentiality and club policies.",
  "In a cup final I made four changes the day before and we lost four-nil. I took personal responsibility, reviewed the video with my staff and realized I had overloaded the players. I changed my process: no more than one or two changes between matches, communicated early. The next season we went unbeaten for twelve matches.",
  "Reliability, competence, integrity and communication. I want complementary expertise rather than people like me, and assistants who challenge me constructively. I define roles clearly, check qualifications and safeguarding, and make sure they align with the club's values and player development.",
];

const incomplete: (string | null)[] = [...good.slice(0, 9), ...Array<null>(9).fill(null)];

const personas: Persona[] = [
  {
    key: "bad",
    label: "Bad: vague answers, results and authority only",
    firstName: "Bad",
    lastName: "Coach",
    profileExtras: {},
    answers: bad,
    expect: { maxPct: 25 },
  },
  {
    key: "weak",
    label: "Weak: general ideas, no real examples",
    firstName: "Weak",
    lastName: "Coach",
    profileExtras: { phoneNumber: "+447700900101" },
    answers: weak,
    expect: { minPct: 12, maxPct: 50 },
  },
  {
    key: "good",
    label: "Good: sound approach, some real examples",
    firstName: "Good",
    lastName: "Coach",
    profileExtras: {
      phoneNumber: "+447700900102",
      availability: "Available from January",
      category: "Senior",
      socialMedia: "https://instagram.com/e2e_good_coach",
    },
    answers: good,
    expect: { minPct: 45, maxPct: 85 },
  },
  {
    key: "best",
    label: "Best: specific, real situation + action + outcome",
    firstName: "Best",
    lastName: "Coach",
    profileExtras: {
      phoneNumber: "+447700900103",
      availability: "Available immediately",
      category: "Senior",
      socialMedia: "https://instagram.com/e2e_best_coach",
      agent: "E2E Sports Agency",
    },
    answers: best,
    expect: { minPct: 62 },
  },
  {
    key: "incomplete",
    label: "Incomplete: good answers for Q1-9, ran out of time",
    firstName: "Incomplete",
    lastName: "Coach",
    profileExtras: {
      phoneNumber: "+447700900104",
      availability: "Available from January",
      category: "Senior",
      socialMedia: "https://instagram.com/e2e_incomplete_coach",
    },
    answers: incomplete,
    expect: { minNotAnswered: 6, noBand: true },
  },
];

export const headCoachScenario: RoleScenario = {
  roleKey: "head_coach",
  role: "On field staff",
  userType: "candidate",
  position: "Head Coach",
  rubricId: "on_field_staff.head_coach.amateur.v1",
  questionCount: 18,
  videoTypes: ["Pre-recorded Interview", "Technical", "Tactical", "Game's Principals"],
  profileBase: {
    dateOfBirth: "1982-04-18",
    placeOfBirth: "Manchester",
    nationality: "English",
    currentClub: "Northfield FC",
    country: "United Kingdom",
    league: "Northern Amateur League",
    gender: "Male",
    position: "Head Coach",
    // The API validation and the form say "optional", but the database model requires it
    // (found by the first run), so every fake candidate fills it.
    socialMedia: "https://instagram.com/e2e_head_coach",
  },
  personas,
};
