<!-- Exported from Estelle (POST /qa action=report, format=md) on 2026-10-28. One edit: the approver's email address is replaced with "the account owner". Otherwise unchanged. -->

# Estelle QA · Tabby (uqeu/estelle-example)

**completed** · https://uqeu.github.io/estelle-example/ (production-readonly) · campaign `qa-d4c1b1608160226d` · finished 2026-10-28T09:03:35.622486+00:00

3 journey(s) planned, 2 passed, 0 confirmed defect(s), 1 suspected, 0 blocked or inconclusive, 0 observed anomaly(ies) while exploring. No repair was attempted by this campaign. A finite campaign tests what it ran; it never proves the product free of bugs.

## Plan

1. **Discover the app** — skipped: the contract states its journeys, so nothing was discovered or planned
2. **Plan the flows to test** — skipped: the contract states its journeys, so nothing was discovered or planned
3. **Review the plan** — done: approved by the account owner at revision 1
4. **Set up test accounts** — skipped: the contract declares no test identities; journeys run signed out
5. **Run UI flows** — done: 3 flow(s): 2 passed, 1 not passed
6. **Run API checks** — skipped: the contract names no source_repo, so there is no code to derive API checks from
7. **Reproduce failures in a fresh browser** — done: re-ran each failed journey in a fresh browser
8. **Write the report** — done: 3 journey(s) planned, 2 passed, 0 confirmed defect(s), 1 suspected, 0 blocked or inconclusive, 0 observed anomaly(ies) while exploring. No repair was attempted by this campaign. A finite campaign tests what it ran; it never proves the product free of bugs.

## Journeys

| journey | kind | role | verdict | flake rate | why |
|---|---|---|---|---|---|
| default-split | ui | anonymous | suspected defect | 0/1 runs (0%) | reproduced, but every failing expectation is a HYPOTHESIS; a person must confirm the expected behaviour first |
| four-people | ui | anonymous | passed | 0/1 runs (0%) | every declared assertion passed in every attempt |
| bad-amount | ui | anonymous | passed | 0/1 runs (0%) | every declared assertion passed in every attempt |

## improvement_suggestion: bad-amount

Uncached asset: /estelle-example/src/app.js: Cache-Control 'max-age=600', max-age under 86,400 s (on 1 attempt(s)); threshold cache_min_s = 86,400 s (house threshold); at unlocated (the contract names no source_repo, so there is no code to point at). Measured, not a model's guess; a suggestion, not a defect.

- step 1: `goto https://uqeu.github.io/estelle-example/`
- step 2: `fill input[name=subtotal] abc`
- step 3: `click button[type=submit]`
- expected (measured): measured_budget /estelle-example/src/app.js: at most 86,400 s
- evidence: ev-75f3d6ead0e5a125

## improvement_suggestion: default-split

Uncached asset: /estelle-example/style.css: Cache-Control 'max-age=600', max-age under 86,400 s (on 2 attempt(s)); threshold cache_min_s = 86,400 s (house threshold); at unlocated (the contract names no source_repo, so there is no code to point at). Measured, not a model's guess; a suggestion, not a defect.

- step 1: `goto https://uqeu.github.io/estelle-example/`
- expected (measured): measured_budget /estelle-example/style.css: at most 86,400 s
- evidence: ev-d5520603cfbc418e, ev-4e4ab079a4d74edf

## improvement_suggestion: default-split

Uncached asset: /estelle-example/src/split.js: Cache-Control 'max-age=600', max-age under 86,400 s (on 2 attempt(s)); threshold cache_min_s = 86,400 s (house threshold); at unlocated (the contract names no source_repo, so there is no code to point at). Measured, not a model's guess; a suggestion, not a defect.

- step 1: `goto https://uqeu.github.io/estelle-example/`
- expected (measured): measured_budget /estelle-example/src/split.js: at most 86,400 s
- evidence: ev-d5520603cfbc418e, ev-4e4ab079a4d74edf

## improvement_suggestion: four-people

Uncached asset: /estelle-example/style.css: Cache-Control 'max-age=600', max-age under 86,400 s (on 1 attempt(s)); threshold cache_min_s = 86,400 s (house threshold); at unlocated (the contract names no source_repo, so there is no code to point at). Measured, not a model's guess; a suggestion, not a defect.

- step 1: `goto https://uqeu.github.io/estelle-example/`
- step 2: `fill input[name=people] 4`
- step 3: `click button[type=submit]`
- expected (measured): measured_budget /estelle-example/style.css: at most 86,400 s
- evidence: ev-9e31ba9d12b2cff3

## improvement_suggestion: four-people

Uncached asset: /estelle-example/src/split.js: Cache-Control 'max-age=600', max-age under 86,400 s (on 1 attempt(s)); threshold cache_min_s = 86,400 s (house threshold); at unlocated (the contract names no source_repo, so there is no code to point at). Measured, not a model's guess; a suggestion, not a defect.

- step 1: `goto https://uqeu.github.io/estelle-example/`
- step 2: `fill input[name=people] 4`
- step 3: `click button[type=submit]`
- expected (measured): measured_budget /estelle-example/src/split.js: at most 86,400 s
- evidence: ev-9e31ba9d12b2cff3

## suspected defect: default-split

reproduced, but every failing expectation is a HYPOTHESIS; a person must confirm the expected behaviour first

- step 1: `goto https://uqeu.github.io/estelle-example/`
- expected (prior-behavior): document_ok
- expected (requirement): text_present $118.00
- expected (requirement): text_present $18.00
- expected (hypothesis): no_console_errors
- expected (hypothesis): a11y_clean
- expected (approved-rule): no_server_errors
- evidence: ev-d5520603cfbc418e, ev-4e4ab079a4d74edf

## improvement_suggestion: four-people

Uncached asset: /estelle-example/src/app.js: Cache-Control 'max-age=600', max-age under 86,400 s (on 1 attempt(s)); threshold cache_min_s = 86,400 s (house threshold); at unlocated (the contract names no source_repo, so there is no code to point at). Measured, not a model's guess; a suggestion, not a defect.

- step 1: `goto https://uqeu.github.io/estelle-example/`
- step 2: `fill input[name=people] 4`
- step 3: `click button[type=submit]`
- expected (measured): measured_budget /estelle-example/src/app.js: at most 86,400 s
- evidence: ev-9e31ba9d12b2cff3

## improvement_suggestion: default-split

Uncached asset: /estelle-example/src/app.js: Cache-Control 'max-age=600', max-age under 86,400 s (on 2 attempt(s)); threshold cache_min_s = 86,400 s (house threshold); at unlocated (the contract names no source_repo, so there is no code to point at). Measured, not a model's guess; a suggestion, not a defect.

- step 1: `goto https://uqeu.github.io/estelle-example/`
- expected (measured): measured_budget /estelle-example/src/app.js: at most 86,400 s
- evidence: ev-d5520603cfbc418e, ev-4e4ab079a4d74edf

## improvement_suggestion: bad-amount

Uncached asset: /estelle-example/style.css: Cache-Control 'max-age=600', max-age under 86,400 s (on 1 attempt(s)); threshold cache_min_s = 86,400 s (house threshold); at unlocated (the contract names no source_repo, so there is no code to point at). Measured, not a model's guess; a suggestion, not a defect.

- step 1: `goto https://uqeu.github.io/estelle-example/`
- step 2: `fill input[name=subtotal] abc`
- step 3: `click button[type=submit]`
- expected (measured): measured_budget /estelle-example/style.css: at most 86,400 s
- evidence: ev-75f3d6ead0e5a125

## improvement_suggestion: bad-amount

Uncached asset: /estelle-example/src/split.js: Cache-Control 'max-age=600', max-age under 86,400 s (on 1 attempt(s)); threshold cache_min_s = 86,400 s (house threshold); at unlocated (the contract names no source_repo, so there is no code to point at). Measured, not a model's guess; a suggestion, not a defect.

- step 1: `goto https://uqeu.github.io/estelle-example/`
- step 2: `fill input[name=subtotal] abc`
- step 3: `click button[type=submit]`
- expected (measured): measured_budget /estelle-example/src/split.js: at most 86,400 s
- evidence: ev-75f3d6ead0e5a125

_A finite campaign tests what it ran; it never proves the product free of bugs._

