// build-and-zip.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import archiver from "archiver";

const projectRoot = process.cwd();
const backendDir = path.join(projectRoot, "backend");
const frontendDir = path.join(projectRoot, "frontend");
const outputZip = path.join(projectRoot, "ycktf-starter.zip");

function run(cmd, cwd) {
  console.log(`\n🛠️ Running: ${cmd} in ${cwd}`);
  execSync(cmd, { stdio: "inherit", cwd });
}

function buildProject() {
  if (fs.existsSync(backendDir)) {
    console.log("\n📦 Building backend...");
    if (fs.existsSync(path.join(backendDir, "tsconfig.json"))) {
      run("npx tsc", backendDir);
    } else {
      console.log("⚠️ No tsconfig.json found — skipping backend build.");
    }
  }

  if (fs.existsSync(frontendDir)) {
    console.log("\n📦 Building frontend...");
    if (fs.existsSync(path.join(frontendDir, "package.json"))) {
      run("npm run build", frontendDir);
    } else {
      console.log("⚠️ No frontend package.json found — skipping frontend build.");
    }
  }
}

function zipProject() {
  console.log("\n🗜️ Creating zip file...");
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
  archive.directory(backendDir, "backend");
  archive.directory(frontendDir, "frontend");
  archive.finalize();
}

(async () => {
  try {
    console.log("🚀 Starting full build + zip process...");
    buildProject();
    zipProject();
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
        await buildIfNeeded(frontendDir);