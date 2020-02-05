import * as core from '@actions/core'
import * as path from 'path'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import NetlifyAPI from 'netlify'
import {context, GitHub} from '@actions/github'

async function run(): Promise<void> {
  try {
    const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN
    const siteId = process.env.NETLIFY_SITE_ID
    const dir = core.getInput('publish-dir', {required: true})
    const productionBranch = core.getInput('production-branch')
    // NOTE: if production-branch is not specified, it is "", so isDraft is always true
    const isDraft: boolean = context.ref !== `refs/heads/${productionBranch}`

    // Create Netlify API client
    const netlifyClient = new NetlifyAPI(netlifyAuthToken)
    // Resolve publish directory
    const deployFolder = path.resolve(process.cwd(), dir)
    // Deploy to Netlify
    const deploy = await netlifyClient.deploy(siteId, deployFolder, {
      draft: isDraft
    })
    // Create a message
    const deployMessage = isDraft
      ? `🚀 Deployed on ${deploy.deploy.deploy_ssl_url}`
      : `🎉 Published on ${deploy.deploy.ssl_url} as production\n🚀 Deployed on ${deploy.deploy.deploy_ssl_url}`
    // Print the URL
    process.stdout.write(`${deployMessage}\n`)

    // Get GitHub token
    const githubToken = core.getInput('github-token')
    if (githubToken !== '') {
      // Create GitHub client
      const githubClient = new GitHub(githubToken)
      // If it is a pull request
      if (context.issue.number !== undefined) {
        // Comment the deploy URL
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        await githubClient.issues.createComment({
          // eslint-disable-next-line @typescript-eslint/camelcase
          issue_number: context.issue.number,
          owner: context.repo.owner,
          repo: context.repo.repo,
          body: `${deployMessage}\n${detailTable()}`
        })
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

function detailTable(): string {
  // eslint-disable-next-line @typescript-eslint/camelcase
  const checkUrl = `${context.payload.repository?.html_url}/commit/${context.sha}/checks`
  return `\
<details>
<summary>Details</summary>
  <table>
    <tr>
      <td>GitHub Actions</td>
      <td>
        <a href="${checkUrl}">${checkUrl}</a>
      </td>
    </tr>
    <tr>
      <td>commit</td><td>${context.sha}</td>
    </tr>
    <tr>
      <td>ref</td><td>${context.ref}</td>
    </tr>
  <table>
</details>
`
}

run()
