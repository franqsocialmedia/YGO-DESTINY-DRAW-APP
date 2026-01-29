import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".json": "application/json",
  ".css": "text/css",
  ".png": "image/png"
};

http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === "/" ? "index.html" : req.url);
  const ext = path.extname(filePath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end("Not found");
  }

  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "text/plain",
    "Cache-Control": "no-cache"
  });

  fs.createReadStream(filePath).pipe(res);
}).listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
