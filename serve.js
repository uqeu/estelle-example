// Tiny static file server for local use: `npm start`, then open
// http://localhost:3000. The live copy is served by GitHub Pages.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = new URL(".", import.meta.url).pathname;
const PORT = Number(process.env.PORT) || 3000;
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
// Static assets never change under the same path, so let browsers keep them
// for a day; the HTML shell is revalidated on every load.
const CACHE_CONTROL = { html: "no-cache", asset: "public, max-age=86400" };

function cacheControlFor(file) {
  return extname(file) === ".html" ? CACHE_CONTROL.html : CACHE_CONTROL.asset;
}

createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const file = normalize(join(ROOT, path === "/" ? "index.html" : path));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
      "cache-control": cacheControlFor(file),
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
