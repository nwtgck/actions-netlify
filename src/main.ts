import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import type {GitHub} from '@actions/github/lib/utils'
import {ReposCreateDeploymentResponseData} from '@octokit/types/dist-types/generated/Endpoints'
import {OctokitResponse} from '@octokit/types/dist-types/OctokitResponse'
import NetlifyAPI from 'netlify'
import * as path from 'path'
import {defaultInputs, Inputs} from './inputs'

const commentIdentifierString =
  '<!-- NETLIFY DEPLOY COMMENT GENERATED BY ACTIONS_NETLIFY -->'

async function findIssueComment(
  githubClient: InstanceType<typeof GitHub>
): Promise<number | undefined> {
  const listCommentsRes = await githubClient.issues.listComments({
    owner: context.issue.owner,
    repo: context.issue.repo,
    // eslint-disable-next-line @typescript-eslint/camelcase
    issue_number: context.issue.number
  })

  const comments = listCommentsRes.data
  for (const comment of comments) {
    // If comment contains the comment identifier
    if (comment.body.includes(commentIdentifierString)) {
      return comment.id
    }
  }
  return undefined
}

async function createGitHubDeployment(
  githubClient: InstanceType<typeof GitHub>,
  environmentUrl: string,
  environment: string,
  description?: string
): Promise<void> {
  const {ref} = context
  const deployment = await githubClient.repos.createDeployment({
    // eslint-disable-next-line @typescript-eslint/camelcase
    auto_merge: false,
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref,
    environment,
    description,
    // eslint-disable-next-line @typescript-eslint/camelcase
    required_contexts: []
  })
  await githubClient.repos.createDeploymentStatus({
    state: 'success',
    // eslint-disable-next-line @typescript-eslint/camelcase
    environment_url: environmentUrl,
    owner: context.repo.owner,
    repo: context.repo.repo,
    // eslint-disable-next-line @typescript-eslint/camelcase
    deployment_id: (deployment as OctokitResponse<ReposCreateDeploymentResponseData>)
      .data.id
  })
}

export async function run(inputs: Inputs): Promise<void> {
  try {
    const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN
    const siteId = process.env.NETLIFY_SITE_ID
    // NOTE: Non-collaborators PRs don't pass GitHub secrets to GitHub Actions.
    if (!(netlifyAuthToken && siteId)) {
      process.stderr.write('Netlify credentials not provided, not deployable')
      return
    }
    const dir = inputs.publishDir()
    const functionsDir: string | undefined = inputs.functionsDir()
    const deployMessage: string | undefined = inputs.deployMessage()
    const productionBranch: string | undefined = inputs.productionBranch()
    const enablePullRequestComment: boolean = inputs.enablePullRequestComment()
    const enableCommitComment: boolean = inputs.enableCommitComment()
    const overwritesPullRequestComment: boolean = inputs.overwritesPullRequestComment()
    const netlifyConfigPath: string | undefined = inputs.netlifyConfigPath()
    const alias: string | undefined = inputs.alias()

    const branchMatchesProduction: boolean =
      !!productionBranch && context.ref === `refs/heads/${productionBranch}`
    const productionDeploy: boolean =
      branchMatchesProduction || inputs.productionDeploy()
    // Create Netlify API client
    const netlifyClient = new NetlifyAPI(netlifyAuthToken)
    // Resolve publish directory
    const deployFolder = path.resolve(process.cwd(), dir)
    // Resolve functions directory
    const functionsFolder =
      functionsDir && path.resolve(process.cwd(), functionsDir)
    // Deploy to Netlify
    const deploy = await netlifyClient.deploy(siteId, deployFolder, {
      draft: !productionDeploy,
      message: deployMessage,
      configPath: netlifyConfigPath,
      ...(productionDeploy ? {} : {branch: alias}),
      fnDir: functionsFolder
    })
    if (productionDeploy && alias !== undefined) {
      // eslint-disable-next-line no-console
      console.warn(
        `Only production deployment was conducted. The alias ${alias} was ignored.`
      )
    }
    // Create a message
    const message = productionDeploy
      ? `🎉 Published on ${deploy.deploy.ssl_url} as production\n🚀 Deployed on ${deploy.deploy.deploy_ssl_url}`
      : `🚀 Deployed on ${deploy.deploy.deploy_ssl_url}`
    // Print the URL
    process.stdout.write(`${message}\n`)

    // Set the deploy URL to outputs for GitHub Actions
    const deployUrl = productionDeploy
      ? deploy.deploy.ssl_url
      : deploy.deploy.deploy_ssl_url
    core.setOutput('deploy-url', deployUrl)

    // Get GitHub token
    const githubToken = inputs.githubToken()
    if (githubToken === '') {
      return
    }
    const markdownComment = `${commentIdentifierString}\n${message}`

    // Create GitHub client
    const githubClient = getOctokit(githubToken)

    if (enableCommitComment) {
      const commitCommentParams = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        // eslint-disable-next-line @typescript-eslint/camelcase
        commit_sha: context.sha,
        body: markdownComment
      }
      // TODO: Remove try
      // NOTE: try-catch is experimentally used because commit message may not be done in some conditions.
      try {
        // Comment to the commit
        await githubClient.repos.createCommitComment(commitCommentParams)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err, JSON.stringify(commitCommentParams, null, 2))
      }
    }

    // If it is a pull request and enable comment on pull request
    if (context.issue.number !== undefined) {
      if (enablePullRequestComment) {
        let commentId: number | undefined = undefined
        if (overwritesPullRequestComment) {
          // Find issue comment
          commentId = await findIssueComment(githubClient)
        }

        // NOTE: if not overwrite, commentId is always undefined
        if (commentId !== undefined) {
          // Update comment of the deploy URL
          await githubClient.issues.updateComment({
            owner: context.issue.owner,
            repo: context.issue.repo,
            // eslint-disable-next-line @typescript-eslint/camelcase
            comment_id: commentId,
            body: markdownComment
          })
        } else {
          // Comment the deploy URL
          await githubClient.issues.createComment({
            // eslint-disable-next-line @typescript-eslint/camelcase
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: markdownComment
          })
        }
      }
    }

    try {
      const environment =
        inputs.githubDeploymentEnvironment() ??
        (productionDeploy
          ? 'production'
          : context.issue.number !== undefined
          ? 'pull request'
          : 'commit')

      const description = inputs.githubDeploymentEnvironment()
      // Create GitHub Deployment
      await createGitHubDeployment(
        githubClient,
        deployUrl,
        environment,
        description
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }

    if (inputs.enableCommitStatus()) {
      try {
        // When "pull_request", context.payload.pull_request?.head.sha is expected SHA.
        // (base: https://github.community/t/github-sha-isnt-the-value-expected/17903/2)
        const sha = context.payload.pull_request?.head.sha ?? context.sha
        await githubClient.repos.createCommitStatus({
          owner: context.repo.owner,
          repo: context.repo.repo,
          context: 'Netlify',
          description: 'Netlify deployment',
          state: 'success',
          sha,
          // eslint-disable-next-line @typescript-eslint/camelcase
          target_url: deployUrl
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run(defaultInputs)
