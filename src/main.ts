import * as core from '@actions/core'
import * as path from 'path'
// @ts-ignore
import NetlifyAPI from 'netlify'
import {context, GitHub} from '@actions/github'

async function run(): Promise<void> {
  try {
    const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN
    const siteId = process.env.NETLIFY_SITE_ID
    const dir = core.getInput('publish-dir', {required: true})

    // Create Netlify API client
    const netlifyClient = new NetlifyAPI(netlifyAuthToken)
    // Resolve publish directory
    const deployFolder = path.resolve(process.cwd(), dir)
    // Deploy to Netlify
    const deploy = await netlifyClient.deploy(siteId, deployFolder)
    // Get deploy URL
    const deployUrl = deploy.deploy.deploy_ssl_url

    // Get GitHub token
    const githubToken = core.getInput('github-token', {required: true})
    // Create GitHub client
    const githubClient = new GitHub(githubToken)
    // If it is a pull request
    if (context.issue.number !== undefined) {
      // Comment the deploy URL
      await githubClient.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: `🚀 Deploy on ${deployUrl}`
      })
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
