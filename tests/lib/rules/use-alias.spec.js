const fs = require('fs')
const findBabelConfig = require('find-babel-config')
const { RuleTester } = require('eslint')

const rule = require('../../../lib/rules/use-alias')
const babelConfig = require('../../babelrc')

jest.mock("find-babel-config", () => ({
  sync: jest.fn(() => ({ config: ({}) })),
}));

const projectRoot = '/project'
let existsSyncSpy
let cwdSpy

beforeEach(() => {
  existsSyncSpy = jest.spyOn(fs, 'existsSync').mockImplementation(
    file => {
      if (file.includes('lib/parsers.js') || file.includes('lib/parsers/index.js')) {
        return false
      }
      return true
    }
  )
  cwdSpy = jest.spyOn(process, 'cwd').mockImplementation(() => projectRoot)
})

afterEach(() => {
  existsSyncSpy.mockRestore()
  cwdSpy.mockRestore()
})

const createInvalid = (...args) => {
  let code
  let type
  let filename
  let options = []
  let errorMessage
  
  const defaultFilename = `${projectRoot}/src/account.js`
  const defaultErrorMessage = 'Do not use relative path for aliased modules'

  if (args.length === 1) {
    const [ obj ] = args
    ;({ code, type, filename, options = [], errorMessage } = obj)
  } else {
    [ code, type, filename, errorMessage ] = args
  }

  return {
    code,
    filename: filename || defaultFilename,
    options: options || [],
    errors: [
      {
        message: errorMessage || defaultErrorMessage,
        type,
      },
    ],
  }
}

describe('with babel config', () => {
  beforeEach(() => {
    findBabelConfig.sync.mockImplementation(() => ({ config: babelConfig }))
  })

  const ruleTester = new RuleTester({ parser: 'babel-eslint' })
  ruleTester.run('module-resolver', rule, {
    valid: [
      "require('actions/api')",
      "require('reducers/api')",
      "require('ClientMain/api')",
      "const { api } = require('actions/api')",
      "const { api } = require('reducers/api')",
      "import('actions/api')",
      "import('reducers/api')",
      "import(`${buildPath}/dist`)",
      "import { api } from 'actions/api'",
      "import { api } from 'reducers/api'",
      "const { api } = dynamic(import('actions/api'))",
      "const { api } = dynamic(import('reducers/api'))",
      "const { server } = require(`${buildPath}/dist`)",
      "const { api } = require('./actions/api')",
      "const { api } = require('./reducers/api')",
      "import { api } from './reducers/api'",
      "import { api } from './reducers/api'",
      "const { api } = dynamic(import('./src/client/main'))",
      createInvalid({
        code: "const { api } = dynamic(import('../reducers/api'))",
        type: "CallExpression",
        options: [{ ignoreDepth: 1 }],
      }),
      createInvalid({
        code: "import ClientMain from '../../../client/main/components/App'",
        type: "ImportDeclaration",
        filename: `${projectRoot}/src/client/main/utils/index.js`,
        options: [{ ignoreDepth: 3 }],
      }),
      createInvalid({
        code: "import('actions/api')",
        type: "ImportDeclaration",
        filename: `${projectRoot}/package/one/src/client/main/utils/index.js`,
        options: [{ projectRoot: "package/one" }],
      }),
    ],
  
    invalid: [
      createInvalid("require('../actions/api')", "CallExpression"),
      createInvalid("require('../reducers/api')", "CallExpression"),
      createInvalid("import('../../actions/api')", "CallExpression", `${projectRoot}/src/client/index.js`),
      createInvalid("import('../../reducers/api')", "CallExpression", `${projectRoot}/src/client/index.js`),
      createInvalid("const { api } = dynamic(import('../actions/api'))", "CallExpression"),
      createInvalid("import ClientMain from '../../../client/main/components/App'", "ImportDeclaration", `${projectRoot}/src/client/main/utils/index.js`),
      createInvalid("const { api } = dynamic(import('../reducers/api'))", "CallExpression"),
      createInvalid({
        code: "const { api } = dynamic(import('../reducers/api'))",
        type: "CallExpression",
        options: [{ ignoreDepth: 2 }],
      }),
      createInvalid({
        code: "import ClientMain from '../../../client/main/components/App'",
        type: "ImportDeclaration",
        filename: `${projectRoot}/src/client/main/utils/index.js`,
        options: [{ ignoreDepth: 1 }],
      }),
      createInvalid({
        code: "import('actions/api')",
        type: "CallExpression",
        filename: `${projectRoot}/package/one/src/client/main/utils/index.js`,
        options: [{ projectRoot: "invalid/project" }],
      }),
      createInvalid({
        code: "import { parseResponse } from '../../../../lib/parsers'",
        type: "ImportDeclaration",
        filename: `${projectRoot}/src/client/main/utils/index.js`,
        options: [{ extensions: ['.ts'] }],
      }),
    ],
  })
})

describe('without babel config', () => {
  beforeEach(() => {
    findBabelConfig.sync.mockImplementation(() => ({ config: {} }))
  })

  const ruleTester = new RuleTester({ parser: 'babel-eslint' })
  ruleTester.run('module-resolver', rule, {
    valid: [],
    invalid: [
      createInvalid({
        code: "require('actions/api')",
        type: "CallExpression",
        errorMessage: 'Unable to find config for babel-plugin-module-resolver'
      }),
      createInvalid({
        code: "import { api } from './reducers/api'",
        type: "ImportDeclaration",
        errorMessage: 'Unable to find config for babel-plugin-module-resolver'
      }),
    ],
  })
})
