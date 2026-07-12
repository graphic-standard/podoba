// Publish @podoba/* with catalog:/workspace: specifiers resolved to concrete
// versions — in the PUBLISHED tarball only. The source package.json keeps
// `catalog:ui` / `workspace:*` for local DX; this script rewrites each package's
// package.json in place, publishes, then restores it (try/finally).
//
// Why: neither `npm publish` nor (reliably) `bun publish` rewrite bun's
// catalog:/workspace: protocols, so a naive publish ships an uninstallable
// package (EUNSUPPORTEDPROTOCOL). This does the resolution deterministically.
//
// The actual upload goes through `npm publish` (not `bun publish`) because CI
// authenticates via npm's OIDC trusted publishing — a feature of the npm CLI
// (>= 11.5.1) that bun does not implement. By the time we shell out, package.json
// already carries concrete versions, so npm just uploads a plain package.
//
// Usage:
//   bun scripts/publish.ts                # publish (npm registry)
//   bun scripts/publish.ts --provenance   # + signed provenance (CI)
//   bun scripts/publish.ts --dry-run      # pack, don't upload
//   bun scripts/publish.ts --print        # resolve + print, no publish (verify)

import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
const ORDER = ["tokens", "tailwind", "react"] as const; // dependency order
const DEP_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;

type Json = Record<string, unknown>;
const read = (p: string): Json => JSON.parse(readFileSync(p, "utf8")) as Json;

const root = read(`${ROOT}package.json`);
const ws = (root.workspaces ?? {}) as Json;
const defaultCatalog = (ws.catalog ?? {}) as Record<string, string>;
const namedCatalogs = (ws.catalogs ?? {}) as Record<string, Record<string, string>>;

// name -> local version (for workspace:* resolution)
const localVersion: Record<string, string> = {};
for (const dir of ORDER) {
  const pkg = read(`${ROOT}packages/${dir}/package.json`);
  localVersion[pkg.name as string] = pkg.version as string;
}

// package.json is the source of truth; @podoba/* publish at one shared version.
const versions = new Set(Object.values(localVersion));
if (versions.size !== 1) {
  throw new Error(`@podoba/* versions are not in lockstep: ${JSON.stringify(localVersion)}`);
}
const [version] = versions;

// On a tag build, the tag MUST match the manifest — otherwise a stray tag would
// silently (re)publish the wrong version. Only fires in CI on a tag push; local
// runs and workflow_dispatch publish whatever package.json says. Use the release
// skill to keep the bump commit and the tag in sync.
if (process.env.GITHUB_REF_TYPE === "tag") {
  const tag = process.env.GITHUB_REF_NAME ?? "";
  if (tag !== `v${version}`) {
    throw new Error(`tag ${tag} != package version v${version} — bump package.json to match the tag (or push the matching tag)`);
  }
}

function resolveSpec(name: string, spec: string): string {
  if (spec.startsWith("workspace:")) {
    const v = localVersion[name];
    if (!v) throw new Error(`workspace dep '${name}' not found in this workspace`);
    return `^${v}`;
  }
  if (spec === "catalog:" || spec === "catalog:default") {
    const v = defaultCatalog[name];
    if (!v) throw new Error(`no default catalog entry for '${name}'`);
    return v;
  }
  if (spec.startsWith("catalog:")) {
    const cat = spec.slice("catalog:".length);
    const v = namedCatalogs[cat]?.[name];
    if (!v) throw new Error(`no catalog '${cat}' entry for '${name}'`);
    return v;
  }
  return spec; // already concrete
}

function resolveDeps(deps: unknown): void {
  if (!deps || typeof deps !== "object") return;
  const d = deps as Record<string, string>;
  for (const name of Object.keys(d)) d[name] = resolveSpec(name, d[name]);
}

const extra = process.argv.slice(2);
const printOnly = extra.includes("--print");
const publishArgs = extra.filter((a) => a !== "--print");

for (const dir of ORDER) {
  const path = `${ROOT}packages/${dir}/package.json`;
  const original = readFileSync(path, "utf8");
  try {
    const pkg = JSON.parse(original) as Json;
    for (const f of DEP_FIELDS) resolveDeps(pkg[f]);
    writeFileSync(path, `${JSON.stringify(pkg, null, "\t")}\n`);

    if (printOnly) {
      console.log(`\n── ${pkg.name}@${pkg.version} (resolved) ──`);
      console.log(JSON.stringify({ dependencies: pkg.dependencies, peerDependencies: pkg.peerDependencies }, null, 2));
      continue;
    }

    console.log(`\n▶ publishing ${pkg.name}@${pkg.version}`);
    const res = spawnSync("npm", ["publish", "--access", "public", ...publishArgs], {
      cwd: `${ROOT}packages/${dir}`,
      stdio: "inherit",
    });
    if (res.status !== 0) throw new Error(`publish failed for ${pkg.name} (exit ${res.status})`);
  } finally {
    writeFileSync(path, original); // restore catalog:/workspace: source
  }
}

console.log(printOnly ? "\n✓ resolution preview complete (source unchanged)" : "\n✓ all @podoba/* published");
