// zip-backend.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import archiver from "archiver";

const backendDir = path.join(process.cwd(), "backend");
const outputZip = path.join(process.cwd(), "backend.zip");

function run(cmd, cwd) {
  console.log(`\n🛠️ Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd });
}

function buildBackend() {
  if (fs.existsSync(path.join(backendDir, "tsconfig.json"))) {
    console.log("📦 Compiling TypeScript backend...");
    run("npx tsc", backendDir);
  } else {
    console.log("⚠️ No tsconfig.json found — skipping TypeScript compilation.");
  }
}

function zipBackend() {
  console.log("\n🗜️ Creating backend.zip...");
  const output = fs.createWriteStream(outputZip);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`✅ ZIP created: ${outputZip}`);
    console.log(`📦 Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(backendDir, "backend");
  archive.finalize();
}

(async () => {
  try {
    console.log("🚀 Building and zipping backend...");
    buildBackend();
    zipBackend();
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
