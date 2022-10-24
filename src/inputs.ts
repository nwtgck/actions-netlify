import * as core from '@actions/core'

// Why use function rather than raw string? => Inputs should be lazy evaluated.
export interface Inputs {
  publishDir(): string
  functionsDir(): string | undefined
  deployMessage(): string | undefined
  productionBranch(): string | undefined
  productionDeploy(): boolean
  projectName(): string | undefined
  enablePullRequestComment(): boolean
  enableCommitComment(): boolean
  enableCommitStatus(): boolean
  enableDeploymentStatus(): boolean
  githubToken(): string
  overwritesPullRequestComment(): boolean
  netlifyConfigPath(): string | undefined
  alias(): string | undefined
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
  projectName() {
    return core.getInput('project-name') || undefined
  },
  enablePullRequestComment() {
    // Default: true
    return (core.getInput('enable-pull-request-comment') || 'true') === 'true'
  },
  enableCommitComment() {
    // Default: true
    return (core.getInput('enable-commit-comment') || 'true') === 'true'
  },
  enableDeploymentStatus() {
    // Default: true
    return (core.getInput('enable-deployment-status') || 'true') === 'true'
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
