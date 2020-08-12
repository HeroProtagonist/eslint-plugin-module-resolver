/* eslint-disable no-template-curly-in-string */
const fs = require('fs')
const babel = require('@babel/core')
const { RuleTester } = require('eslint')

const rule = require('../../../lib/rules/use-alias')
const babelConfig = require('../../babelrc')

jest.mock('@babel/core')

const projectRoot = '/project'
let existsSyncSpy
let cwdSpy

beforeEach(() => {
  existsSyncSpy = jest.spyOn(fs, 'existsSync').mockImplementation((file) => {
    if (file.includes('lib/parsers.js') || file.includes('lib/parsers/index.js')) {
      return false
    }
    return true
  })
  cwdSpy = jest.spyOn(process, 'cwd').mockImplementation(() => projectRoot)
})

afterEach(() => {
  existsSyncSpy.mockRestore()
  cwdSpy.mockRestore()
})

const createInvalid = ({
  code,
  type,
  filename = `${projectRoot}/src/account.js`,
  options = [],
  errorMessage = 'Do not use relative path for aliased modules',
  output = null,
}) => ({
  code,
  filename,
  options,
  errors: [
    {
      message: errorMessage,
      type,
    },
  ],
  output,
})

describe('with babel config', () => {
  beforeEach(() => {
    babel.loadPartialConfig.mockImplementation(() => ({ options: babelConfig }))
  })

  const ruleTester = new RuleTester({
    parser: require('@babel/eslint-parser'),
    plugins: ['@babel'],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  })

  ruleTester.run('module-resolver', rule, {
    valid: [
      "require('actions/api')",
      "require('reducers/api')",
      "require('ClientMain/api')",
      "const { api } = require('actions/api')",
      "const { api } = require('reducers/api')",
      "import('actions/api')",
      "import('reducers/api')",
      'import(`${buildPath}/dist`)',
      "import { api } from 'actions/api'",
      "import { api } from 'reducers/api'",
      "const { api } = dynamic(import('actions/api'))",
      "const { api } = dynamic(import('reducers/api'))",
      'const { server } = require(`${buildPath}/dist`)',
      "const { api } = require('./actions/api')",
      "const { api } = require('./reducers/api')",
      "import { api } from './reducers/api'",
      "import { api } from './reducers/api'",
      "const { api } = dynamic(import('./src/client/main'))",
      createInvalid({
        code: "const { api } = dynamic(import('../reducers/api'))",
        type: 'ImportExpression',
        options: [{ ignoreDepth: 1 }],
      }),
      createInvalid({
        code: "import ClientMain from '../../../client/main/components/App'",
        type: 'ImportDeclaration',
        filename: `${projectRoot}/src/client/main/utils/index.js`,
        options: [{ ignoreDepth: 3 }],
      }),
      createInvalid({
        code: "import('actions/api')",
        type: 'ImportExpression',
        filename: `${projectRoot}/package/one/src/client/main/utils/index.js`,
        options: [{ projectRoot: 'package/one' }],
      }),
    ],

    invalid: [
      createInvalid({ code: "require('../actions/api')", type: 'CallExpression', output: "require('actions/api')" }),
      createInvalid({ code: "require('../reducers/api')", type: 'CallExpression', output: "require('reducers/api')" }),
      createInvalid({
        code: "import('../../actions/api')",
        type: 'ImportExpression',
        filename: `${projectRoot}/src/client/index.js`,
        output: "import('actions/api')",
      }),
      createInvalid({
        code: "import('../../reducers/api')",
        type: 'ImportExpression',
        filename: `${projectRoot}/src/client/index.js`,
        output: "import('reducers/api')",
      }),
      createInvalid({
        code: "const { api } = dynamic(import('../actions/api'))",
        type: 'ImportExpression',
        output: "const { api } = dynamic(import('actions/api'))",
      }),
      createInvalid({
        code: "import ClientMain from '../../../client/main/components/App'",
        type: 'ImportDeclaration',
        filename: `${projectRoot}/src/client/main/utils/index.js`,
        output: "import ClientMain from 'ClientMain/components/App'",
      }),
      createInvalid({
        code: "const { api } = dynamic(import('../reducers/api'))",
        type: 'ImportExpression',
        output: "const { api } = dynamic(import('reducers/api'))",
      }),
      createInvalid({
        code: "const { api } = dynamic(import('../reducers/api'))",
        type: 'ImportExpression',
        options: [{ ignoreDepth: 2 }],
        output: "const { api } = dynamic(import('reducers/api'))",
      }),
      createInvalid({
        code: "import ClientMain from '../../../client/main/components/App'",
        type: 'ImportDeclaration',
        filename: `${projectRoot}/src/client/main/utils/index.js`,
        options: [{ ignoreDepth: 1 }],
        output: "import ClientMain from 'ClientMain/components/App'",
      }),
      createInvalid({
        code: "import('actions/api')",
        type: 'ImportExpression',
        filename: `${projectRoot}/package/one/src/client/main/utils/index.js`,
        options: [{ projectRoot: 'invalid/project' }],
        errorMessage: 'Invalid project root specified',
      }),
      createInvalid({
        code: "import { parseResponse } from '../../../../lib/parsers'",
        type: 'ImportDeclaration',
        filename: `${projectRoot}/src/client/main/utils/index.js`,
        output: "import { parseResponse } from 'lib/parsers'",
        options: [{ extensions: ['.ts'] }], // check it honor extension option
      }),
    ],
  })
})

describe('without babel config', () => {
  beforeEach(() => {
    babel.loadPartialConfig.mockImplementation(() => ({ options: { plugins: [] } }))
  })

  const ruleTester = new RuleTester({
    parser: require('@babel/eslint-parser'),
    plugins: ['@babel'],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  })
  ruleTester.run('module-resolver', rule, {
    valid: [],
    invalid: [
      createInvalid({
        code: "require('actions/api')",
        type: 'CallExpression',
        errorMessage: 'Unable to find config for babel-plugin-module-resolver',
      }),
      createInvalid({
        code: "import { api } from './reducers/api'",
        type: 'ImportDeclaration',
        errorMessage: 'Unable to find config for babel-plugin-module-resolver',
      }),
    ],
  })
})
