import * as core from '@actions/core'
import { context, getOctokit } from '@actions/github'
import type { GitHub } from '@actions/github/lib/utils'
import { sh } from "shellsync"
import NetlifyAPI from 'netlify'
import * as path from 'path'
import { defaultInputs, Inputs } from './inputs'
import * as crypto from 'crypto'

function getCommentIdentifier(siteId: string): string {
  const sha256SiteId: string = crypto
    .createHash('sha256')
    .update(siteId)
    .digest('hex')
  return `<!-- NETLIFY DEPLOY COMMENT GENERATED BY ACTIONS_NETLIFY - APP ID SHA256: ${sha256SiteId} -->`
}

async function findIssueComment(
  githubClient: InstanceType<typeof GitHub>,
  siteId: string
): Promise<number | undefined> {
  const listCommentsRes = await githubClient.rest.issues.listComments({
    owner: context.issue.owner,
    repo: context.issue.repo,
    // eslint-disable-next-line @typescript-eslint/camelcase
    issue_number: context.issue.number
  })

  const comments = listCommentsRes.data
  const commentIdentifier = getCommentIdentifier(siteId)

  for (const comment of comments) {
    // If comment contains the comment identifier
    if (comment.body?.includes(commentIdentifier)) {
      return comment.id
    }
  }
  return undefined
}

async function createGitHubDeployment(
  githubClient: InstanceType<typeof GitHub>,
  environmentUrl: string,
  environment: string,
  description: string | undefined
): Promise<void> {
  const deployRef = context.payload.pull_request?.head.sha ?? context.sha


  const deployment = await githubClient.rest.repos.createDeployment({
    // eslint-disable-next-line @typescript-eslint/camelcase
    auto_merge: false,
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref: deployRef,
    environment,
    description,
    // eslint-disable-next-line @typescript-eslint/camelcase
    required_contexts: []
  })

  if (deployment.status === 201) {
    await githubClient.rest.repos.createDeploymentStatus({
      state: 'success',
      // eslint-disable-next-line @typescript-eslint/camelcase
      environment_url: environmentUrl,
      owner: context.repo.owner,
      repo: context.repo.repo,
      // eslint-disable-next-line @typescript-eslint/camelcase
      deployment_id: deployment.data.id
    })
  } else {
    throw `Deployment ${deployment.data.message} failed with error code ${deployment.status} `
  }
}

export async function run(inputs: Inputs): Promise<void> {
  try {
    const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN
    const siteId = process.env.NETLIFY_SITE_ID
    // NOTE: Non-collaborators PRs don't pass GitHub secrets to GitHub Actions.
    if (!(netlifyAuthToken && siteId)) {
      const errorMessage = 'Netlify credentials not provided, not deployable'
      if (inputs.failsWithoutCredentials()) {
        throw new Error(errorMessage)
      }
      process.stderr.write(errorMessage)
      return
    }
    const dir = inputs.publishDir()
    const functionsDir: string | undefined = inputs.functionsDir()
    const deployMessage: string | undefined = inputs.deployMessage()
    const productionBranch: string | undefined = inputs.productionBranch()
    const enablePullRequestComment: boolean = inputs.enablePullRequestComment()
    const enableCommitComment: boolean = inputs.enableCommitComment()
    const overwritesPullRequestComment: boolean =
      inputs.overwritesPullRequestComment()
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
    // const deploy = await netlifyClient.deploy(siteId, deployFolder, {
    //   draft: !productionDeploy,
    //   message: deployMessage,
    //   configPath: netlifyConfigPath,
    //   ...(productionDeploy ? {} : { branch: alias }),
    //   fnDir: functionsFolder
    // })

    const deployMode = productionDeploy ? "--prod" : `--alias=${alias}`
    console.log("deployMode:", deployMode)
    console.log("deployFolder:", deployFolder)
    console.log("message:", deployMessage)


    {
      const response = sh`npm install netlify-cli -g`
    }

    const deployResult = sh.array`npx netlify deploy --dir=${deployFolder} --message=${deployMessage ?? "From NetlifyDeploy"} ${deployMode}`

    if (productionDeploy && alias !== undefined) {
      // eslint-disable-next-line no-console
      console.warn(
        `Only production deployment was conducted. The alias ${alias} was ignored.`
      )
    }
    console.info(deployResult)
    const deploy = deployResult[6].split(" ")?.[0] ? {production : deployResult[6].split(" ")[8] } : {staging: deployResult[5].split(" ")[3]}

    const deployURL = deploy.production ?? deploy.staging
    // Create a message
    const message = "production" in deploy
      ? `🎉 Production deployed on ${deploy.production}`
      : `🚀 Staging Deployed on ${deploy.staging}`
    // Print the URL
    process.stdout.write(`${message}\n`)


    core.setOutput('deploy-url', deployURL)

    // Get GitHub token
    const githubToken = inputs.githubToken()
    if (githubToken === '') {
      return
    }
    const markdownComment = `${getCommentIdentifier(siteId)}\n${message}`

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
        await githubClient.rest.repos.createCommitComment(commitCommentParams)
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
          commentId = await findIssueComment(githubClient, siteId)
        }

        // NOTE: if not overwrite, commentId is always undefined
        if (commentId !== undefined) {
          // Update comment of the deploy URL
          await githubClient.rest.issues.updateComment({
            owner: context.issue.owner,
            repo: context.issue.repo,
            // eslint-disable-next-line @typescript-eslint/camelcase
            comment_id: commentId,
            body: markdownComment
          })
        } else {
          // Comment the deploy URL
          await githubClient.rest.issues.createComment({
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

      const description = inputs.githubDeploymentDescription()
      // Create GitHub Deployment
      await createGitHubDeployment(
        githubClient,
        deployURL,
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
        await githubClient.rest.repos.createCommitStatus({
          owner: context.repo.owner,
          repo: context.repo.repo,
          context: 'Netlify',
          description: 'Netlify deployment',
          state: 'success',
          sha,
          // eslint-disable-next-line @typescript-eslint/camelcase
          target_url: deployURL
        })
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(
        "Error in actions-netlify and Error wasn't an instance of Error"
      )
    }
  }
}

run(defaultInputs)
