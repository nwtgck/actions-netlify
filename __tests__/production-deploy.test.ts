import * as path from 'path'
import {mocked} from 'ts-jest/utils'
import {defaultInputs} from '../src/inputs'
import {context} from '@actions/github'
import {run} from '../src/main'

const mockDeploy = jest.fn()
const mockCreateComment = jest.fn()

jest.mock('netlify', () => {
  return jest.fn().mockImplementation(() => {
    return {deploy: mockDeploy}
  })
})
jest.mock('../src/inputs')
jest.mock('@actions/github', () => {
  const {context} = jest.requireActual('@actions/github')

  return {
    context: Object.assign({}, context, {
      issue: {
        number: 42
      },
      repo: {
        owner: 'foo bar',
        repo: 'foo'
      }
    }),
    getOctokit: () => ({
      issues: {
        createComment: mockCreateComment
      },
      repos: {
        createDeployment: jest.fn().mockReturnValue({data: {id: 1}}),
        createDeploymentStatus: jest.fn()
      }
    })
  }
})

mockDeploy.mockResolvedValue({deploy: {}})
mocked(defaultInputs.githubToken).mockReturnValue('') // NOTE: empty string means the input is not specified
mocked(defaultInputs.publishDir).mockReturnValue('my-publish-dir')

process.env.NETLIFY_AUTH_TOKEN = 'dummy-netlify-auth-token'
process.env.NETLIFY_SITE_ID = 'dummy-netlify-site-id'

describe('Draft deploy', () => {
  const expectedSiteId = 'dummy-netlify-site-id'
  const expectedDeployFolder = path.resolve(process.cwd(), 'my-publish-dir')

  test('deploy should have draft true when production-deploy input is false', async () => {
    mocked(defaultInputs.productionDeploy).mockReturnValue(false)

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith(
      expectedSiteId,
      expectedDeployFolder,
      {
        draft: true
      }
    )
  })

  test('PR comment should contain project name', async () => {
    mocked(defaultInputs.enablePullRequestComment).mockReturnValue(true)
    mocked(defaultInputs.githubToken).mockReturnValue('dummy-github-token')
    mocked(defaultInputs.projectName).mockReturnValue('My Project')

    await run(defaultInputs)

    expect(mockCreateComment).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.stringContaining(`Deployed My Project`)
      })
    )
  })

  test('PR comment should not contain "undefined" if project name is empty', async () => {
    mocked(defaultInputs.enablePullRequestComment).mockReturnValue(true)
    mocked(defaultInputs.githubToken).mockReturnValue('dummy-github-token')
    mocked(defaultInputs.projectName).mockReturnValue(undefined)
    mockDeploy.mockResolvedValue({
      deploy: {deploy_ssl_url: 'https://foobar.com/'}
    })

    await run(defaultInputs)

    expect(mockCreateComment).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.not.stringContaining(`undefined`)
      })
    )
  })

  test('deploy should have draft false when production-deploy input is true', async () => {
    mocked(defaultInputs.productionDeploy).mockReturnValue(true)

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith(
      expectedSiteId,
      expectedDeployFolder,
      {
        draft: false
      }
    )
  })

  test('deploy should have draft false when production-branch matches context ref', async () => {
    mocked(defaultInputs.productionDeploy).mockReturnValue(false)
    mocked(defaultInputs.productionBranch).mockReturnValue('master')

    context.ref = 'refs/heads/master'

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith(
      expectedSiteId,
      expectedDeployFolder,
      {
        draft: false
      }
    )
  })

  test('deploy should have draft true when production-branch doesnt match context ref', async () => {
    mocked(defaultInputs.productionDeploy).mockReturnValue(false)
    mocked(defaultInputs.productionBranch).mockReturnValue('master')

    context.ref = 'refs/heads/not-master'

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith(
      expectedSiteId,
      expectedDeployFolder,
      {
        draft: true
      }
    )
  })

  test('deploy should have draft true when production-branch is not defined', async () => {
    mocked(defaultInputs.productionDeploy).mockReturnValue(false)
    mocked(defaultInputs.productionBranch).mockReturnValue(undefined)

    context.ref = 'refs/heads/master'

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith(
      expectedSiteId,
      expectedDeployFolder,
      {
        draft: true
      }
    )
  })
})
