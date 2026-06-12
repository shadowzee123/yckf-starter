#!/usr/bin/env node
/**
 * release.js
 * Single-file cross-platform release builder + zipper
 *
 * Usage: node release.js
 *
 * - Drops a zip named "ycktf-starter-release.zip" in the current working directory.
 * - Excludes node_modules, .git, .env* files, .DS_Store, and common IDE folders.
 * - Attempts to auto-install `archiver` if missing.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TMP_DIR = path.join(ROOT, 'release_temp');
const OUT_ZIP = path.join(ROOT, 'ycktf-starter-release.zip');

async function ensureArchiver() {
  try {
    require.resolve('archiver');
    return require('archiver');
  } catch (e) {
    console.log('[release] "archiver" not found. Installing temporarily...');
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const r = spawnSync(npm, ['install', 'archiver', '--no-save'], { stdio: 'inherit' });
    if (r.status !== 0) {
      console.error('[release] Failed to install archiver. Please run "npm install archiver --no-save" and retry.');
      process.exit(1);
    }
    return require('archiver');
  }
}

function runCmd(cmd, args, opts = {}) {
  console.log(`[run] ${cmd} ${args.join(' ')}`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (res.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
}

function safeReadFileIfExists(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

function redactEnv(content) {
  if (!content) return '';
  return content
    .split(/\r?\n/)
    .map(line => {
      if (/^\s*#/.test(line) || line.trim() === '') return line;
      const [k, v] = line.split('=');
      if (!k) return line;
      const key = k.trim();
      // keep non-sensitive defaults, redact others
      const safeKeys = ['PORT', 'DATABASE_URL', 'NODE_ENV', 'REACT_APP_API_URL'];
      if (safeKeys.includes(key)) return `${key}=${v ? v.trim() : ''}`;
      return `${key}=REPLACE_ME`;
    })
    .join('\n');
}

async function mkdirp(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

const IGNORE_DIRS = new Set(['node_modules', '.git', '.idea', '.vscode', '__pycache__']);
const IGNORE_FILES_PREFIX = ['.env', '.env.local', '.env.development', '.env.production'];
const IGNORE_FILES_EXACT = new Set(['.DS_Store', 'Thumbs.db']);

async function copyProject(srcDir, dstDir) {
  await mkdirp(dstDir);
  const entries = await fs.promises.readdir(srcDir, { withFileTypes: true });
  for (const ent of entries) {
    const name = ent.name;
    const srcPath = path.join(srcDir, name);
    const dstPath = path.join(dstDir, name);

    // skip patterns
    if (IGNORE_DIRS.has(name)) continue;
    if (IGNORE_FILES_EXACT.has(name)) continue;
    if (IGNORE_FILES_PREFIX.some(pfx => name.startsWith(pfx))) continue;

    if (ent.isDirectory()) {
      await copyProject(srcPath, dstPath);
    } else if (ent.isFile()) {
      // copy file
      await mkdirp(path.dirname(dstPath));
      await fs.promises.copyFile(srcPath, dstPath);
    } else if (ent.isSymbolicLink()) {
      try {
        const real = await fs.promises.readlink(srcPath);
        await mkdirp(path.dirname(dstPath));
        await fs.promises.symlink(real, dstPath);
      } catch {
        // ignore symlink errors
      }
    }
  }
}

async function writeEnvExample(projectPath) {
  const envPath = path.join(projectPath, '.env');
  const examplePath = path.join(projectPath, '.env.example');
  const raw = safeReadFileIfExists(envPath);
  if (raw !== null) {
    console.log(`[release] Writing ${path.relative(ROOT, examplePath)} (redacted)`);
    await fs.promises.writeFile(examplePath, redactEnv(raw), 'utf8');
  } else {
    // if no .env, create a minimal example only if none exists
    if (!fs.existsSync(examplePath)) {
      console.log(`[release] Creating minimal ${path.relative(ROOT, examplePath)}`);
      const sample = `# Example .env\nPORT=4000\nDATABASE_URL=file:./dev.db\nJWT_SECRET=REPLACE_ME\n`;
      await fs.promises.writeFile(examplePath, sample, 'utf8');
    }
  }
}

async function buildIfNeeded(projectPath) {
  const pkgPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(pkgPath)) return;
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch { return; }
  const hasBuild = pkg.scripts && pkg.scripts.build;
  if (!hasBuild) {
    console.log(`[release] No build script in ${path.relative(ROOT, pkgPath)} — skipping build.`);
    return;
  }

  console.log(`[release] Running "npm install" and "npm run build" in ${path.relative(ROOT, projectPath)}`);
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  runCmd(npm, ['install'], { cwd: projectPath });
  runCmd(npm, ['run', 'build'], { cwd: projectPath });
}

async function makeZip(srcDir, outZip) {
  const archiver = await ensureArchiver();
  const output = fs.createWriteStream(outZip);
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`[release] Created zip: ${outZip} (${archive.pointer()} bytes)`);
      resolve();
    });
    archive.on('warning', err => { console.warn('[archiver warning]', err); });
    archive.on('error', err => reject(err));

    archive.pipe(output);
    // add all files under srcDir root (so zip contains backend/ and frontend/)
    archive.directory(srcDir + path.sep, false);
    archive.finalize();
  });
}

(async function main() {
  try {
    console.log('[release] Starting release builder');

    // remove previous temp and zip if present
    if (fs.existsSync(TMP_DIR)) {
      console.log('[release] Removing old temp folder');
      fs.rmSync(TMP_DIR, { recursive: true, force: true });
    }
    if (fs.existsSync(OUT_ZIP)) {
      console.log('[release] Removing old zip file');
      fs.rmSync(OUT_ZIP);
    }

    await mkdirp(TMP_DIR);

    // produce env.example for backend and frontend
    const backendDir = path.join(ROOT, 'backend');
    const frontendDir = path.join(ROOT, 'frontend');

    if (fs.existsSync(backendDir)) {
      await writeEnvExample(backendDir);
      await buildIfNeeded(backendDir);
      console.log('[release] Copying backend to temp');
      await copyProject(backendDir, path.join(TMP_DIR, 'backend'));
    } else {
      console.log('[release] No backend/ folder found — skipping backend');
    }

    if (fs.existsSync(frontendDir)) {
      await writeEnvExample(frontendDir);
      await buildIfNeeded(frontendDir);
      console.log('[release] Copying frontend to temp');
      await copyProject(frontendDir, path.join(TMP_DIR, 'frontend'));
    } else {
      console.log('[release] No frontend/ folder found — skipping frontend');
    }

    // copy root files (package.json, README, prisma, etc.) but ignore node_modules/.git/.env
    console.log('[release] Copying top-level files');
    const topEntries = await fs.promises.readdir(ROOT, { withFileTypes: true });
    for (const ent of topEntries) {
      const name = ent.name;
      if (name === 'backend' || name === 'frontend' || IGNORE_DIRS.has(name)) continue;
      if (IGNORE_FILES_EXACT.has(name)) continue;
      if (IGNORE_FILES_PREFIX.some(pfx => name.startsWith(pfx))) continue;

      const srcPath = path.join(ROOT, name);
      const dstPath = path.join(TMP_DIR, name);

      if (ent.isDirectory()) {
        // copy minimal directories like prisma, src (if present at root), etc.
        if (name === 'node_modules' || name === '.git') continue;
        await copyProject(srcPath, dstPath);
      } else if (ent.isFile()) {
        await mkdirp(path.dirname(dstPath));
        await fs.promises.copyFile(srcPath, dstPath);
      }
    }

    // finally zip the temp folder
    console.log('[release] Zipping release_temp ->', OUT_ZIP);
    await makeZip(TMP_DIR, OUT_ZIP);

    // cleanup
    console.log('[release] Cleaning up temporary files');
    fs.rmSync(TMP_DIR, { recursive: true, force: true });

    console.log('[release] Done! Review the zip and the included .env.example files before sharing.');
  } catch (err) {
    console.error('[release] Error:', err && (err.stack || err.message || err));
    process.exit(1);
  }
})();
