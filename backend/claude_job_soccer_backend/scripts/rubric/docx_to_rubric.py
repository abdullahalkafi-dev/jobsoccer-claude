import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))
import json, re, sys, os
from docx_blocks import blocks

SRC = sys.argv[1]; OUT = sys.argv[2]
FILES = {
    "Head Coach Final.docx": ("head_coach", "Head Coach", "amateur"),
    "Amateur Coach Final.docx": ("assistant_coach", "Assistant Coach", "amateur"),
    "Academy Director Final .docx": ("academy_director", "Academy Director", None),
    "Attacking Coach Final.docx": ("attacking_coach", "Specific Offensive Coach", None),
    "Defensive Coach Final.docx": ("defensive_coach", "Specific Defensive Coach", None),
    "Director of Coaching Final.docx": ("director_of_coaching", "Director of Coaching", None),
    "GK Coach Final.docx": ("goalkeeper_coach", "GK Coach", None),
    "Mental Coach Final.docx": ("mental_coach", "Mental Coach", None),
    "Scout Final.docx": ("scout", "Scout", None),
    "Technical Director Final.docx": ("technical_director", "Technical Director", None),
    "Technical Player Development Final .docx": ("technical_development_coach", "Specific Technical Coach", None),
    "Video Analysis Final.docx": ("video_analyst", "Video Analyst Coach", None),
}
DISPLAY = {"assistant_coach": "Amateur Assistant Coach", "director_of_coaching": "Director of Coaching", "head_coach": "Head Coach"}
REAL = re.compile(r"\b(describe a (time|situation|match|challenge|case|decision)|give an example|share an example|an example of|tell us about a|a situation where|a time when|toughest|most difficult|from a failure)\b", re.I)


def clean(t):
    for a, b in (("�", "'"), ("’", "'"), ("‘", "'"), ("“", '"'), ("”", '"'), ("–", "-"), ("—", "-")):
        t = t.replace(a, b)
    return re.sub(r"\s+", " ", t).strip()


def strip_quotes(t):
    return t.strip().strip('"').strip("'").strip()


def after(t):
    return clean(t.split(":", 1)[1]) if ":" in t else ""


def convert(fname):
    key, position, level = FILES[fname]
    bl = [(k, s, (clean(t) if k == "p" else [[clean(c) for c in r] for r in t])) for k, s, t in blocks(os.path.join(SRC, fname))]
    title = next((t for k, s, t in bl if k == "p" and s == "Title" and t != "Jobsoccer"), None)
    if not title:
        title = next((t for k, s, t in bl if k == "p" and "Interview" in t and s in ("", "Heading1")), fname)
    display = DISPLAY.get(key) or re.sub(r"\s*(AI )?Interview (Assessment|Evaluation Rubric)$", "", title)
    state = {"h1": None, "q": None, "cal": None, "strong": False}
    sections = []; rules = []; approach = []; orphan_cals = []; overall = {}
    summary = None; role_id = None; review_flags = []; bands_text = None

    def new_cal():
        return {"response": None, "suggestedScore": None, "label": None, "assessment": None}

    def target_cal(field):
        q = state["q"]
        if q is not None and state["h1"] == 4:
            c = q.setdefault("calibration", new_cal())
            if c[field] is not None:
                c = new_cal(); orphan_cals.append(c)
            return c
        if state["cal"] is None or state["cal"][field] is not None:
            state["cal"] = new_cal(); orphan_cals.append(state["cal"])
        return state["cal"]

    for k, s, t in bl:
        if k == "p" and s == "Heading1":
            m = re.match(r"^(\d+)\.\s*(.*)", t)
            state["h1"] = int(m.group(1)) if m else None; state["strong"] = False
            continue
        h1 = state["h1"]
        if k == "t":
            if h1 in (5, 8) and not overall:
                for r in t:
                    if len(r) >= 2:
                        overall[r[0]] = r[1]
            continue
        is_resp = re.match(r"^(Supplied|Fictional candidate|Illustrative candidate|Candidate) response", t)
        is_cal = is_resp or re.match(r"^(Suggested score|Assessment:)", t)
        if is_cal and (h1 is None or h1 < 4):
            if is_resp:
                target_cal("response")["response"] = strip_quotes(after(t))
            elif t.startswith("Suggested score"):
                m = re.search(r"(\d)\s*/\s*4\s*-?\s*(.*)", t); c = target_cal("suggestedScore")
                c["suggestedScore"] = int(m.group(1)); c["label"] = clean(m.group(2)) or None
            else:
                target_cal("assessment")["assessment"] = after(t)
        elif h1 == 1 and s != "Heading2":
            approach.append(t)
        elif h1 == 3 and s.startswith("List"):
            rules.append(t)
        elif h1 == 4:
            q = state["q"]
            if s == "Heading2":
                m = re.match(r"^([A-Z])\.\s*(.*)", t)
                if m:
                    sections.append({"id": m.group(1), "name": m.group(2), "questions": []}); state["q"] = None
                continue
            if s == "Heading3":
                m = re.match(r"^(\d+)\.\s*(.*)", t)
                q = {"id": int(m.group(1)), "text": m.group(2), "evaluates": None, "strong": [], "acceptable": None, "weakOrConcerning": None}
                sections[-1]["questions"].append(q); state["q"] = q; state["strong"] = False
                continue
            if t.startswith("Evaluates:"):
                q["evaluates"] = after(t); state["strong"] = False
            elif t.startswith("Strong answer"):
                state["strong"] = True
            elif s.startswith("List") and state["strong"] and q is not None:
                q["strong"].append(t)
            elif t.startswith("Acceptable:"):
                q["acceptable"] = after(t); state["strong"] = False
            elif t.startswith("Weak or concerning:"):
                q["weakOrConcerning"] = after(t); state["strong"] = False
            elif is_resp:
                target_cal("response")["response"] = strip_quotes(after(t))
            elif t.startswith("Suggested score"):
                m = re.search(r"(\d)\s*/\s*4\s*-?\s*(.*)", t); c = target_cal("suggestedScore")
                c["suggestedScore"] = int(m.group(1)); c["label"] = clean(m.group(2)) or None
            elif t.startswith("Assessment:"):
                target_cal("assessment")["assessment"] = after(t)
        elif h1 in (5, 8) and summary is None and len(t) > 120 and not t.startswith("This ") and not t.startswith("Interpretation"):
            summary = t
        elif h1 == 10 and t.startswith("Role ID:"):
            role_id = re.split(r"[\s-]", after(t))[0].strip(".,;")
        elif h1 == 7 and s.startswith("List"):
            review_flags.append(t)
        elif h1 == 11:
            bands_text = t

    questions = [qq for sec in sections for qq in sec["questions"]]
    pending = [c for c in orphan_cals if c["suggestedScore"] is not None or c["response"]]
    for qq in questions:
        c = qq.get("calibration")
        if (c is None or c["suggestedScore"] is None) and pending:
            qq["calibration"] = pending.pop(0)
        qq["requiresRealSituation"] = bool(REAL.search(qq["text"]))
    n = len(questions)
    bands = [{"min": int(a), "max": int(b), "label": lab.strip()} for a, b, lab in re.findall(r"(\d+)\s*-\s*(\d+)\s*:\s*([^|.]+)", bands_text or "")]
    level_suffix = f".{level}" if level else ""
    rubric = {
        "rubricId": f"on_field_staff.{key}{level_suffix}.v1",
        "version": 1,
        "status": "draft-from-client-doc",
        "extends": "interview.base.v1",
        "sourceFile": fname,
        "role": "On field staff",
        "position": position,
        "displayName": display,
    }
    if level:
        rubric["level"] = level
    if role_id:
        rubric["clientRoleId"] = role_id
    rubric.update({
        "evaluationApproach": {
            "summary": approach[0] if approach else None,
            "corePrinciple": next((after(a) for a in approach if a.startswith("Core principle")), None),
        },
        "maxScorePerQuestion": 4,
        "maxTotalScore": 4 * n,
        "mandatoryRules": [{"id": f"R{i + 1}", "rule": r} for i, r in enumerate(rules)],
    })
    if review_flags:
        rubric["humanReviewFlags"] = review_flags
    if bands:
        rubric["bands"] = bands
    rubric["calibrationOverall"] = {
        "totalScore": overall.get("Total score"), "percentage": overall.get("Percentage"),
        "classification": overall.get("Classification"), "strongestAreas": overall.get("Strongest areas"),
        "mainWeaknesses": overall.get("Main weaknesses"), "summary": summary,
    }
    rubric["sections"] = sections
    return rubric


os.makedirs(OUT, exist_ok=True)
for fname in FILES:
    r = convert(fname)
    qs = [q for s in r["sections"] for q in s["questions"]]
    total = sum((q.get("calibration") or {}).get("suggestedScore") or 0 for q in qs)
    missing = [q["id"] for q in qs if not q.get("calibration") or q["calibration"]["suggestedScore"] is None or not q["calibration"]["response"] or not q["calibration"]["assessment"]]
    incomplete = [q["id"] for q in qs if not (q["evaluates"] and q["strong"] and q["acceptable"] and q["weakOrConcerning"])]
    real = [q["id"] for q in qs if q["requiresRealSituation"]]
    print(f'{r["rubricId"]:52} q={len(qs)} total={total}/{r["maxTotalScore"]} doc={r["calibrationOverall"]["totalScore"]} rules={len(r["mandatoryRules"])} bands={len(r.get("bands", []))} roleId={r.get("clientRoleId")} flags={len(r.get("humanReviewFlags", []))} missingCal={missing} incomplete={incomplete} real={real}')
    with open(os.path.join(OUT, r["rubricId"] + ".json"), "w", encoding="utf-8") as fh:
        json.dump(r, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
