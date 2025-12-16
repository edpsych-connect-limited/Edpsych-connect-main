import fs from "fs";
import path from "path";

type Finding = {
  file: string;
  pattern: string;
  line: number;
  preview: string;
};

const DEFAULT_ROOTS = ["src"]; // keep fast and predictable

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs"]);

// High-signal tokens. (Not exhaustive; designed to avoid false positives.)
const PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: "Stripe secret key", re: /\bsk_(live|test)_[0-9a-zA-Z]{10,}\b/ },
  { name: "OpenAI key", re: /\bsk-[0-9a-zA-Z]{20,}\b/ },
  { name: "GitHub token", re: /\bghp_[0-9a-zA-Z]{20,}\b/ },
  { name: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Google API key", re: /\bAIza[0-9A-Za-z\-_]{20,}\b/ },
  { name: "Slack token", re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { name: "Private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  // Neon / Postgres creds commonly start with these prefixes.
  { name: "Neon credential", re: /\bnpg_[0-9A-Za-z]{10,}\b/ },
];

const IGNORE_DIRS = new Set([
  "node_modules",
  ".next",
  ".next_build_gate",
  ".next_build_gate_alt",
  ".next_build_local",
  ".next_build_local2",
  ".git",
  "dist",
  "build",
]);

function walk(dir: string, out: string[]) {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const e of entries) {
    if (e.name.startsWith(".")) {
      // allow .env.example etc elsewhere; for src scan keep hidden dirs out
      // (still catches in code files)
    }

    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      walk(full, out);
      continue;
    }

    if (!e.isFile()) continue;
    const ext = path.extname(e.name);
    if (!EXTENSIONS.has(ext)) continue;
    out.push(full);
  }
}

function scanFile(file: string): Finding[] {
  const findings: Finding[] = [];
  let text: string;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return findings;
  }

  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i] ?? "";
    for (const p of PATTERNS) {
      if (p.re.test(lineText)) {
        findings.push({
          file,
          pattern: p.name,
          line: i + 1,
          preview: lineText.trim().slice(0, 220),
        });
      }
    }
  }

  return findings;
}

function main() {
  const repoRoot = process.cwd();

  const roots = process.argv.slice(2);
  const scanRoots = roots.length ? roots : DEFAULT_ROOTS;

  const files: string[] = [];
  for (const r of scanRoots) {
    const abs = path.isAbsolute(r) ? r : path.join(repoRoot, r);
    if (!fs.existsSync(abs)) continue;
    walk(abs, files);
  }

  const allFindings: Finding[] = [];
  for (const f of files) {
    allFindings.push(...scanFile(f));
  }

  if (allFindings.length > 0) {
    // eslint-disable-next-line no-console
    console.error("SECURITY_SCAN_FAIL: Potential hardcoded secrets detected");
    for (const finding of allFindings.slice(0, 50)) {
      // eslint-disable-next-line no-console
      console.error(
        `- ${path.relative(repoRoot, finding.file)}:${finding.line} [${finding.pattern}] ${finding.preview}`,
      );
    }

    if (allFindings.length > 50) {
      // eslint-disable-next-line no-console
      console.error(`...and ${allFindings.length - 50} more`);
    }

    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log("SECURITY_SCAN_OK");
}

main();
