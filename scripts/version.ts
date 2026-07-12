// Bump every @podoba/* package to one shared version (lockstep). package.json is
// the source of truth for releases; this is the only supported way to change it,
// so the three manifests can never drift. Prints the NEW version to stdout (and
// nothing else there) so callers can capture it: NEW=$(bun scripts/version.ts patch)
//
// Usage:
//   bun scripts/version.ts            # patch bump (default)
//   bun scripts/version.ts patch      # 0.0.2 -> 0.0.3
//   bun scripts/version.ts minor      # 0.0.2 -> 0.1.0
//   bun scripts/version.ts major      # 0.0.2 -> 1.0.0
//   bun scripts/version.ts 1.2.3      # explicit

import { readFileSync, writeFileSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const ORDER = ["tokens", "tailwind", "react"] as const;
const SEMVER = /^\d+\.\d+\.\d+$/;

const paths = ORDER.map((dir) => `${ROOT}packages/${dir}/package.json`);
const sources = paths.map((p) => readFileSync(p, "utf8"));
const pkgs = sources.map((s) => JSON.parse(s) as Record<string, unknown>);

// Enforce the lockstep invariant before touching anything.
const current = new Set(pkgs.map((p) => p.version as string));
if (current.size !== 1) {
  throw new Error(`@podoba/* versions are not in lockstep: ${pkgs.map((p) => `${p.name}@${p.version}`).join(", ")}`);
}
const [cur] = current;

function nextVersion(cur: string, bump: string): string {
  if (SEMVER.test(bump)) return bump; // explicit
  const [a, b, c] = cur.split(".").map(Number);
  if (bump === "major") return `${a + 1}.0.0`;
  if (bump === "minor") return `${a}.${b + 1}.0`;
  if (bump === "patch") return `${a}.${b}.${c + 1}`;
  throw new Error(`unknown bump '${bump}' — use patch | minor | major | x.y.z`);
}

const next = nextVersion(cur, process.argv[2] ?? "patch");
if (next === cur) throw new Error(`new version ${next} equals current ${cur}`);

// Surgically replace only the "version" field so the diff is one line per file
// and existing formatting (inline arrays, key order, indentation) is preserved.
const VERSION_FIELD = /("version"\s*:\s*")[^"]+(")/;
for (let i = 0; i < paths.length; i++) {
  if (!VERSION_FIELD.test(sources[i])) throw new Error(`no "version" field in ${paths[i]}`);
  writeFileSync(paths[i], sources[i].replace(VERSION_FIELD, `$1${next}$2`));
}

// Human log to stderr; the version alone to stdout (for `NEW=$(...)`).
console.error(`✓ bumped @podoba/* ${cur} → ${next}`);
console.log(next);
