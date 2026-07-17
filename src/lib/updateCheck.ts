/**
 * Decide whether the deployed site is a newer build than the one this tab is
 * running.
 *
 * Every merge to main deploys and replaces all content-hashed chunk files, but
 * the human-facing version number (v3.4.0) is bumped only occasionally.
 * Comparing version numbers alone therefore misses most deploys, leaving open
 * tabs to break on stale chunk URLs ("Failed to fetch dynamically imported
 * module") with no update banner. The build ID (git SHA) changes on every
 * deploy, so it is the primary signal; the version number remains as a
 * fallback for old clients / old version.json files that predate buildId.
 */
export interface BuildInfo {
  version?: string
  buildId?: string
}

export function isNewBuildAvailable(local: BuildInfo, remote: BuildInfo | null | undefined): boolean {
  if (!remote) return false

  // Primary: per-deploy build ID. Only meaningful when both sides have a real
  // one ('dev' means the local bundle was built without git — can't compare).
  if (remote.buildId && local.buildId && local.buildId !== 'dev') {
    return remote.buildId !== local.buildId
  }

  // Fallback: human-facing version number (pre-buildId version.json files).
  if (remote.version && local.version) {
    return remote.version !== local.version
  }

  return false
}
