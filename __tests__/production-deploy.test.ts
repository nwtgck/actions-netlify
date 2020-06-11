import * as path from 'path'
import {defaultInputs} from '../src/inputs'
import {context} from '@actions/github'
import {run} from '../src/main'
import Mock = jest.Mock

const mockDeploy = jest.fn()

jest.mock('netlify', () => {
  return jest.fn().mockImplementation(() => {
    return {deploy: mockDeploy}
  })
})
jest.mock('../src/inputs')
jest.mock('@actions/github')

mockDeploy.mockResolvedValue({deploy: {}})
;(<Mock<any>>defaultInputs.githubToken).mockReturnValue('')
;(<Mock<any>>defaultInputs.publishDir).mockReturnValue('publish-dir')

process.env.NETLIFY_AUTH_TOKEN = 'auth-token'
process.env.NETLIFY_SITE_ID = 'site-id'

describe('Draft deploy', () => {
  const expectedDeployFolder = path.resolve(process.cwd(), 'publish-dir')

  test('deploy should have draft true when production-deploy input is false', async () => {
    ;(<Mock<any>>defaultInputs.productionDeploy).mockReturnValue(false)

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith('site-id', expectedDeployFolder, {
      draft: true
    })
  })

  test('deploy should have draft false when production-deploy input is true', async () => {
    ;(<Mock<any>>defaultInputs.productionDeploy).mockReturnValue(true)

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith('site-id', expectedDeployFolder, {
      draft: false
    })
  })

  test('deploy should have draft false when production-branch matches context ref', async () => {
    ;(<Mock<any>>defaultInputs.productionDeploy).mockReturnValue(false)
    ;(<Mock<any>>defaultInputs.productionBranch).mockReturnValue('master')

    context.ref = 'refs/heads/master'

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith('site-id', expectedDeployFolder, {
      draft: false
    })
  })

  test('deploy should have draft true when production-branch doesnt match context ref', async () => {
    ;(<Mock<any>>defaultInputs.productionDeploy).mockReturnValue(false)
    ;(<Mock<any>>defaultInputs.productionBranch).mockReturnValue('master')

    context.ref = 'refs/heads/not-master'

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith('site-id', expectedDeployFolder, {
      draft: true
    })
  })

  test('deploy should have draft true when production-branch is not defined', async () => {
    ;(<Mock<any>>defaultInputs.productionDeploy).mockReturnValue(false)
    ;(<Mock<any>>defaultInputs.productionBranch).mockReturnValue(undefined)

    context.ref = 'refs/heads/master'

    await run(defaultInputs)

    expect(mockDeploy).toHaveBeenCalledWith('site-id', expectedDeployFolder, {
      draft: true
    })
  })
})
