# estelle-example

Tabby is a small bill splitter: enter the bill, the tip and how many people, and it tells you what each
person owes. It is here as an example of a repository [Estelle](https://www.fatelabs.ca) has worked on,
so you can see what that looks like on real code instead of a screenshot.

Live copy: https://uqeu.github.io/estelle-example/

```sh
npm start   # http://localhost:3000
npm test
```

No dependencies. The page is plain HTML and a JavaScript module; the tests use Node's built-in runner.

| Path | What it is |
|---|---|
| `index.html`, `style.css` | The page |
| `src/split.js` | The arithmetic: parsing amounts, adding the tip, dividing the total. Money is kept in cents |
| `src/app.js` | Reads the form and writes the result |
| `test/split.test.js` | Tests for `src/split.js` |
| `serve.js` | A static file server for running it locally |

## What Estelle did here

- **Reviewed a pull request.** [Pull request #1](https://github.com/uqeu/estelle-example/pull/1) splits the
  bill into whole-cent shares, and it has a real bug, left in on purpose: each share is rounded on its own,
  so $100.00 split three ways collects $99.99. The test only tries an amount that divides evenly, so it
  passes. Prism, Estelle's pull request reviewer, flagged both the rounding and the test. Its review is in
  the pull request description and as inline comments. The pull request is not merged.
- **Tested the live page.** A Twice run (Estelle's QA) opened the [live copy](https://uqeu.github.io/estelle-example/)
  in a browser and ran three journeys: the default split, four people, and a bill that is not a number.
  Two passed. The third was marked a suspected defect because the browser console logged a 404 for
  `/favicon.ico`, which this site does not have. The report is in [`estelle/twice-run.md`](estelle/twice-run.md)
  and the exact test plan in [`estelle/twice-contract.json`](estelle/twice-contract.json).
- **Atlas.** Estelle has indexed this repository and started writing its Atlas (a generated guide to the
  codebase). It is not finished yet; a link goes here when it is.

This is a demo repository. Nothing here is a production service.
