const rule = require('../../../lib/rules/use-alias')
const { RuleTester } = require('eslint')

const fs = require('fs')

jest.spyOn(fs, 'existsSync').mockImplementation(() => true)
jest.spyOn(process, 'cwd').mockImplementation(() => '/project')

// Change working directory so closest .babelrc is the one in tests/
process.chdir(__dirname)

const createInvalid = (...args) => {
  let code
  let type
  let filename
  let options = []
  let defaultFilename = '/project/src/account.js'

  if (args.length === 1) {
    const [ obj ] = args
    ;({ code, type, filename, options } = obj)
  } else {
    [ code, type, filename ] = args
  }

  filename = filename || defaultFilename

  return {
    code,
    filename,
    options,
    errors: [
      {
        message: 'Do not use relative path for aliased modules',
        type,
      },
    ],
  }
}

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
    "import { api } from 'reducers/api'",
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
      filename: "/project/src/client/main/utils/index.js",
      options: [{ ignoreDepth: 3 }],
    }),
  ],

  invalid: [
    createInvalid("require('../actions/api')", "CallExpression"),
    createInvalid("require('../reducers/api')", "CallExpression"),
    createInvalid("import('../../actions/api')", "CallExpression", "/project/src/client/index.js"),
    createInvalid("import('../../reducers/api')", "CallExpression", "/project/src/client/index.js"),
    createInvalid("const { api } = dynamic(import('../actions/api'))", "CallExpression"),
    createInvalid("import ClientMain from '../../../client/main/components/App'", "ImportDeclaration", "/project/src/client/main/utils/index.js"),
    createInvalid("const { api } = dynamic(import('../reducers/api'))", "CallExpression"),
    createInvalid({
      code: "const { api } = dynamic(import('../reducers/api'))",
      type: "CallExpression",
      options: [{ ignoreDepth: 2 }],
    }),
    createInvalid({
      code: "import ClientMain from '../../../client/main/components/App'",
      type: "ImportDeclaration",
      filename: "/project/src/client/main/utils/index.js",
      options: [{ ignoreDepth: 1 }],
    }),
  ],
})
