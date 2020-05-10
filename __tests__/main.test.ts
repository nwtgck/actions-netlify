import {wait} from '../src/wait'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {defaultInputs} from '../src/inputs'

/**
 * With input
 * @param inputName
 * @param value
 * @param f
 */
export async function withInput(
  inputName: string,
  value: string,
  f: () => void | Promise<void>
): Promise<void> {
  // (from: https://github.com/actions/toolkit/blob/83dd3ef0f1e5bc93c5ab7072e1edf1715a01ba9d/packages/core/src/core.ts#L71)
  const envName = `INPUT_${inputName.replace(/ /g, '_').toUpperCase()}`
  process.env[envName] = value
  await f()
  // NOTE: Not sure this is correct deletion
  delete process.env[envName]
}

describe('defaultInputs', () => {
  test('publishDir', () => {
    withInput('publish-dir', './my_publish_dir', () => {
      const publishDir: string = defaultInputs.publishDir()
      expect(publishDir).toBe('./my_publish_dir')
    })
  })

  describe('deployMessage', () => {
    test('it should be a string when specified', () => {
      withInput('deploy-message', 'Deploy with GitHub Actions', () => {
        const deployMessage: string | undefined = defaultInputs.deployMessage()
        expect(deployMessage).toBe('Deploy with GitHub Actions')
      })
    })

    test('it should be undefined when not specified', () => {
      const deployMessage: string | undefined = defaultInputs.deployMessage()
      expect(deployMessage).toBe(undefined)
    })
  })

  describe('productionBranch', () => {
    test('it should be a string when specified', () => {
      withInput('production-branch', 'master', () => {
        const productionBranch:
          | string
          | undefined = defaultInputs.productionBranch()
        expect(productionBranch).toBe('master')
      })
    })

    test('it should be undefined when not specified', () => {
      const deployMessage: string | undefined = defaultInputs.productionBranch()
      expect(deployMessage).toBe(undefined)
    })
  })

  describe('enablePullRequestComment', () => {
    test('it should be default value (true) when not specified', () => {
      const b: boolean = defaultInputs.enablePullRequestComment()
      expect(b).toBe(true)
    })

    test('it should be true when "true" specified', () => {
      withInput('enable-pull-request-comment', 'true', () => {
        const b: boolean = defaultInputs.enablePullRequestComment()
        expect(b).toBe(true)
      })
    })

    test('it should be true when "false" specified', () => {
      withInput('enable-pull-request-comment', 'false', () => {
        const b: boolean = defaultInputs.enablePullRequestComment()
        expect(b).toBe(false)
      })
    })
  })

  describe('enableCommitComment', () => {
    test('it should be default value (true) when not specified', () => {
      const b: boolean = defaultInputs.enableCommitComment()
      expect(b).toBe(true)
    })

    test('it should be true when "true" specified', () => {
      withInput('enable-commit-comment', 'true', () => {
        const b: boolean = defaultInputs.enableCommitComment()
        expect(b).toBe(true)
      })
    })

    test('it should be true when "false" specified', () => {
      withInput('enable-commit-comment', 'false', () => {
        const b: boolean = defaultInputs.enableCommitComment()
        expect(b).toBe(false)
      })
    })
  })

  describe('enableCommitComment', () => {
    test('it should be empty string when not specified', () => {
      const t: string = defaultInputs.githubToken()
      expect(t).toBe('')
    })

    test('it should be a string when specified', () => {
      withInput('github-token', 'DUMMY_GITHUB_TOKEN', () => {
        const t: string = defaultInputs.githubToken()
        expect(t).toBe('DUMMY_GITHUB_TOKEN')
      })
    })
  })
})

// Old tests below

test('throws invalid number', async () => {
  const input = parseInt('foo', 10)
  await expect(wait(input)).rejects.toThrow('milliseconds not a number')
})

test('wait 500 ms', async () => {
  const start = new Date()
  await wait(500)
  
  const end = new Date()
  var delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  if (false) {
    process.env['INPUT_MILLISECONDS'] = '500'
    const ip = path.join(__dirname, '..', 'lib', 'main.js')
    const options: cp.ExecSyncOptions = {
      env: process.env
    }
    console.log(cp.execSync(`node ${ip}`, options).toString())
  }
})
