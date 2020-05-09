import * as core from '@actions/core'
import {context, GitHub} from '@actions/github'
import NetlifyAPI from 'netlify'
import * as path from 'path'
import {defaultInputs, Inputs} from './inputs'

async function run(inputs: Inputs): Promise<void> {
  try {
    const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN
    const siteId = process.env.NETLIFY_SITE_ID
    // NOTE: Non-collaborators PRs don't pass GitHub secrets to GitHub Actions.
    if (!(netlifyAuthToken && siteId)) {
      process.stdout.write('Netlify credentials not provided, not deployable')
      return
    }
    const dir = inputs.publishDir()
    const deployMessage: string | undefined = inputs.deployMessage()
    const productionBranch: string | undefined = inputs.productionBranch()
    const enablePullRequestComment: boolean = inputs.enablePullRequestComment()
    const enableCommitComment: boolean = inputs.enableCommitComment()
    const isDraft: boolean =
      productionBranch === undefined ||
      context.ref !== `refs/heads/${productionBranch}`

    // Create Netlify API client
    const netlifyClient = new NetlifyAPI(netlifyAuthToken)
    // Resolve publish directory
    const deployFolder = path.resolve(process.cwd(), dir)
    // Deploy to Netlify
    const deploy = await netlifyClient.deploy(siteId, deployFolder, {
      draft: isDraft,
      message: deployMessage
    })
    // Create a message
    const message = isDraft
      ? `🚀 Deployed on ${deploy.deploy.deploy_ssl_url}`
      : `🎉 Published on ${deploy.deploy.ssl_url} as production\n🚀 Deployed on ${deploy.deploy.deploy_ssl_url}`
    // Print the URL
    process.stdout.write(`${message}\n`)

    // Set the deploy URL to outputs for GitHub Actions
    core.setOutput(
      'deploy-url',
      isDraft ? deploy.deploy.deploy_ssl_url : deploy.deploy.ssl_url
    )

    // Get GitHub token
    const githubToken = inputs.githubToken()
    if (githubToken !== '') {
      // Create GitHub client
      const githubClient = new GitHub(githubToken)

      if (enableCommitComment) {
        const commitCommentParams = {
          owner: context.repo.owner,
          repo: context.repo.repo,
          // eslint-disable-next-line @typescript-eslint/camelcase
          commit_sha: context.sha,
          body: message
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
      if (context.issue.number !== undefined && enablePullRequestComment) {
        // Comment the deploy URL
        await githubClient.issues.createComment({
          // eslint-disable-next-line @typescript-eslint/camelcase
          issue_number: context.issue.number,
          owner: context.repo.owner,
          repo: context.repo.repo,
          body: message
        })
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run(defaultInputs)
