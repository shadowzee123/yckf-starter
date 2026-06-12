// zip-project.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import archiver from "archiver";

const rootDir = process.cwd();
const backendDir = path.join(rootDir, "backend");
const frontendDir = path.join(rootDir, "frontend");
const outputZip = path.join(rootDir, "project.zip");

function run(cmd, cwd) {
  console.log(`\n🛠️ Running: ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd });
}

function buildBackend() {
  const tsconfigPath = path.join(backendDir, "tsconfig.json");
  if (fs.existsSync(tsconfigPath)) {
    console.log("📦 Compiling TypeScript backend...");
    run("npx tsc", backendDir);
  } else {
    console.log("⚠️ No tsconfig.json found — skipping backend TypeScript compilation.");
  }
}

function zipProject() {
  console.log("\n🗜️ Creating project.zip (excluding node_modules)...");

  const output = fs.createWriteStream(outputZip);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`✅ ZIP created successfully: ${outputZip}`);
    console.log(`📦 Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  // Add backend (excluding node_modules)
  if (fs.existsSync(backendDir)) {
    console.log("📁 Adding backend...");
    archive.glob("**/*", {
      cwd: backendDir,
      ignore: ["node_modules/**", "dist/**"],
      dot: true,
    }, { prefix: "backend" });
  }

  // Add frontend (if exists)
  if (fs.existsSync(frontendDir)) {
    console.log("📁 Adding frontend...");
    archive.glob("**/*", {
      cwd: frontendDir,
      ignore: ["node_modules/**", "dist/**", "build/**"],
      dot: true,
    }, { prefix: "frontend" });
  } else {
    console.log("⚠️ No frontend folder found — skipping.");
  }

  archive.finalize();
}

(async () => {
  try {
    console.log("🚀 Building and zipping full project...");
    buildBackend();
    zipProject();
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
