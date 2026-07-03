export interface BuildInfoInput {
  vercelCommitSha?: string
  viteBuildId?: string
  packageVersion?: string
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function shortIdentifier(value: string | undefined): string | null {
  const id = clean(value)
  if (!id) return null
  return id.length > 12 ? id.slice(0, 7) : id
}

export function formatBuildLabel(input: BuildInfoInput): string {
  const commit = shortIdentifier(input.vercelCommitSha)
  if (commit) return `Build ${commit}`

  const viteBuild = shortIdentifier(input.viteBuildId)
  if (viteBuild) return `Build ${viteBuild}`

  const version = clean(input.packageVersion)
  if (version) return `Build v${version.replace(/^v/i, '')}`

  return 'Build local'
}

export const BUILD_LABEL = formatBuildLabel({
  vercelCommitSha: __VERCEL_GIT_COMMIT_SHA__,
  viteBuildId: __VITE_BUILD_ID__,
  packageVersion: __APP_VERSION__,
})
