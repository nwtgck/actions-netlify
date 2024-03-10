import * as core from '@actions/core'

// Why use function rather than raw string? => Inputs should be lazy evaluated.
export interface Inputs {
  publishDir(): string
  functionsDir(): string | undefined
  deployMessage(): string | undefined
  productionBranch(): string | undefined
  productionDeploy(): boolean
  enablePullRequestComment(): boolean
  enableCommitComment(): boolean
  enableCommitStatus(): boolean
  githubToken(): string
  overwritesPullRequestComment(): boolean
  netlifyConfigPath(): string | undefined
  alias(): string | undefined
  enableGithubDeployment(): boolean
  githubDeploymentAutoInactive(): boolean
  githubDeploymentEnvironment(): string | undefined
  githubDeploymentDescription(): string | undefined
  failsWithoutCredentials(): boolean
}

export const defaultInputs: Inputs = {
  publishDir() {
    return core.getInput('publish-dir', {required: true})
  },
  functionsDir() {
    return core.getInput('functions-dir') || undefined
  },
  deployMessage() {
    return core.getInput('deploy-message') || undefined
  },
  productionBranch() {
    return core.getInput('production-branch') || undefined
  },
  productionDeploy(): boolean {
    // Default: false
    return core.getInput('production-deploy') === 'true'
  },
  enablePullRequestComment() {
    // Default: true
    return (core.getInput('enable-pull-request-comment') || 'true') === 'true'
  },
  enableCommitComment() {
    // Default: true
    return (core.getInput('enable-commit-comment') || 'true') === 'true'
  },
  enableCommitStatus() {
    // Default: true
    return (core.getInput('enable-commit-status') || 'true') === 'true'
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
  alias() {
    return core.getInput('alias') || undefined
  },
  enableGithubDeployment() {
    // Default: true
    return (core.getInput('enable-github-deployment') || 'true') === 'true'
  },
  githubDeploymentAutoInactive() {
    // Default: true
    return (core.getInput('github-deployment-auto-inactive') || 'true') === 'true'
  },
  githubDeploymentEnvironment(): string | undefined {
    return core.getInput('github-deployment-environment') || undefined
  },
  githubDeploymentDescription(): string | undefined {
    return core.getInput('github-deployment-description') || undefined
  },
  failsWithoutCredentials(): boolean {
    // Default: false
    return core.getInput('fails-without-credentials') === 'true'
  }
}
