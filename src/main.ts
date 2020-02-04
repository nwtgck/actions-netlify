import * as core from '@actions/core'
import * as path from 'path'
// @ts-ignore
import NetlifyAPI from 'netlify'

async function run(): Promise<void> {
  try {
    const netlifyAuthToken = process.env.NETLIFY_AUTH_TOKEN
    const siteId = process.env.NETLIFY_SITE_ID
    const dir = core.getInput('publish-dir', {required: true})

    const client = new NetlifyAPI(netlifyAuthToken)
    const deployFolder = path.resolve(process.cwd(), dir)
    const deploy = await client.deploy(siteId, deployFolder)
    core.debug(deploy.deploy.deploy_ssl_url)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
