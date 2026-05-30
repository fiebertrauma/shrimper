const fs = require("node:fs/promises");
const path = require("node:path");
const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";
const rootDir = __dirname;
const shrimpDir = path.join(rootDir, "shrimps");
const publicDir = path.join(rootDir, "public");

app.set("trust proxy", true);
app.disable("x-powered-by");

app.use(
  "/shrimps",
  express.static(shrimpDir, {
    immutable: true,
    maxAge: "1d",
  }),
);

app.use(
  express.static(publicDir, {
    extensions: ["html"],
    maxAge: 0,
  }),
);

app.get("/api/shrimp", async (_req, res, next) => {
  try {
    const files = await fs.readdir(shrimpDir);
    const gifs = files.filter((file) => file.toLowerCase().endsWith(".gif"));

    if (gifs.length === 0) {
      res.status(404).json({ error: "No shrimp GIFs found." });
      return;
    }

    const file = gifs[Math.floor(Math.random() * gifs.length)];
    res.json({ src: `shrimps/${encodeURIComponent(file)}`, count: gifs.length });
  } catch (error) {
    next(error);
  }
});

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  if (req.accepts("html")) {
    res.sendFile(path.join(publicDir, "index.html"));
    return;
  }

  res.status(404).json({ error: "Not found" });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "The shrimp machine got fizzy." });
});

const server = app.listen(port, host);

server.on("listening", () => {
  console.log(`Shrimper is listening on http://${host}:${port}`);
});

server.on("error", (error) => {
  console.error(`Shrimper could not bind to ${host}:${port}`);
  console.error(error);
  process.exitCode = 1;
});
