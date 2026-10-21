# Client scoring guide (.docx) -> rubric JSON

Converts the client's Word scoring guides into the JSON files in
`src/shared/ai/rubric/rubrics/`. The client wording is kept as written.

```
python scripts/rubric/docx_to_rubric.py "<folder with the .docx files>" <output folder>
```

- Add each new file to the `FILES` map in `docx_to_rubric.py`
  (`file name -> (rubric key, TPosition value, level or None)`).
- The script prints, per file, the sample total it found vs the total stated in
  the document. They must match before the JSON is copied into the backend.
- `requiresRealSituation` is our reading of the question text (situation,
  example, toughest challenge...), not client wording. Check it by eye.
- Then import the new JSON in `rubric.registry.ts` and add its expected sample
  total to `rubric.registry.test.ts`. Never edit a rubric that already produced
  evaluations: create `v2` instead.
