---
name: release
description: Cut a new @podoba/* release — bump all package versions in lockstep, commit, tag, and push. Pushing the tag triggers the npm OIDC publish workflow. Use when the user says "release", "cut a release", "publish a new version", "bump and publish", or similar.
---

# Release @podoba/\*

All three packages (`@podoba/tokens`, `@podoba/tailwind`, `@podoba/react`) publish
together at **one shared version** ("lockstep"). `package.json` is the source of
truth; the git tag is a trigger that must match it (`scripts/publish.ts` enforces
this in CI). Publishing itself happens in GitHub Actions via npm OIDC trusted
publishing — this skill only prepares and tags the release, it does not publish
directly.

**Arguments:** `patch` (default) · `minor` · `major` · or an explicit `x.y.z`.

## Steps

1. **Preconditions.** Bail out (tell the user) unless all hold:
   - On `main`: `git rev-parse --abbrev-ref HEAD` → `main`.
   - Clean tree: `git status --porcelain` is empty.
   - Up to date: `git fetch origin && git status -sb` shows no "behind".

2. **Bump the version** with the script — it enforces lockstep and writes all
   three manifests, printing the new version to stdout (`BUMP` is the skill arg:
   `patch` | `minor` | `major` | explicit `x.y.z`):
   ```bash
   cd "$(git rev-parse --show-toplevel)"
   NEW=$(bun scripts/version.ts "${BUMP:-patch}")
   echo "release: v$NEW"
   ```
   Guard: the tag `v$NEW` must not already exist — `git tag -l "v$NEW"` and
   `git ls-remote --tags origin "v$NEW"` must both be empty. If either isn't, stop
   and revert the bump (`git checkout -- packages/*/package.json`).

3. **Sanity check** before committing:
   ```bash
   bun run typecheck
   bun scripts/publish.ts --print   # verify catalog:/workspace: resolve cleanly
   ```

5. **Commit** (explicit file list — never `git add -A`):
   ```bash
   git add packages/tokens/package.json packages/tailwind/package.json packages/react/package.json \
     && git commit -m "release: v$NEW"
   git push origin main
   ```

6. **Tag and push** — this is what triggers the publish workflow. The tag must be
   `v$NEW` exactly, or `scripts/publish.ts` aborts the CI publish:
   ```bash
   git tag "v$NEW" && git push origin "v$NEW"
   ```

7. **Report.** Tell the user the workflow is running and how to watch it:
   ```bash
   gh run watch "$(gh run list --workflow=publish.yml -L1 --json databaseId -q '.[0].databaseId')"
   ```
   Then verify it landed: `npm view @podoba/tokens version` should show `$NEW`.

## One-time prerequisite (not part of every release)

Publishing uses **npm OIDC trusted publishing — no token**. Each package must have
a trusted publisher configured at npmjs.com (package → Settings → Trusted Publisher
→ GitHub Actions): org `graphic-standard`, repo `podoba`, workflow `publish.yml`.
If a publish fails with an auth/OIDC error, this is almost certainly why — surface
it to the user; the skill cannot configure it.
