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

- **Reviewed a pull request.** Prism, Estelle's pull request reviewer, ran on the open pull request
  (link below). The change has a real bug in it, left in on purpose, and the pull request is not merged.
- **Tested the live page.** A Twice run (Estelle's QA) went through the page in a browser.
- **Wrote an Atlas.** Estelle's generated guide to this codebase.

Links:

- Pull request: _added once it exists_
- Twice run: _added once it exists_
- Atlas: _added once it exists_

This is a demo repository. Nothing here is a production service.
