import * as core from '@actions/core'

// Why use function rather than raw string? => Inputs should be lazy evaluated.
export interface Inputs {
  publishDir(): string
  deployMessage(): string | undefined
  productionBranch(): string | undefined
  enablePullRequestComment(): boolean
  enableCommitComment(): boolean
  githubToken(): string
  overwritesPullRequestComment(): boolean
  netlifyConfigPath(): string | undefined
  deployBranch(): string | undefined
}

export const defaultInputs: Inputs = {
  publishDir() {
    return core.getInput('publish-dir', {required: true})
  },
  deployMessage() {
    return core.getInput('deploy-message') || undefined
  },
  productionBranch() {
    return core.getInput('production-branch') || undefined
  },
  enablePullRequestComment() {
    // Default: true
    return (core.getInput('enable-pull-request-comment') || 'true') === 'true'
  },
  enableCommitComment() {
    // Default: true
    return (core.getInput('enable-commit-comment') || 'true') === 'true'
  },
  githubToken() {
    return core.getInput('github-token')
  },
  overwritesPullRequestComment() {
    // Default: true
    return (
      (core.getInput('overwrites-pull-request-comment') || 'true') === 'true'
    )
  },
  netlifyConfigPath() {
    return core.getInput('netlify-config-path') || undefined
  },
  deployBranch() {
    return core.getInput('deploy-branch') || undefined
  }
}
