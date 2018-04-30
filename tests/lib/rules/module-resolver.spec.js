const rule = require('../../../lib/rules/module-resolver')
const { RuleTester } = require('eslint')

// Change working directory so closest .babelrc is the one in tests/
process.chdir(__dirname)

const ruleTester = new RuleTester({ parser: 'babel-eslint' })
ruleTester.run('module-resolver', rule, {
  valid: [
    "require('actions/api')",
    "require('reducers/api')",
    "const { api } = require('actions/api')",
    "const { api } = require('reducers/api')",
    "import('actions/api')",
    "import('reducers/api')",
    "import { api } from 'reducers/api'",
    "import { api } from 'reducers/api'",
    "const { api } = dynamic(import('actions/api'))",
    "const { api } = dynamic(import('reducers/api'))",
  ],

  invalid: [
    {
      code: '',
      errors: [
        {
          message: 'Fill me in.',
          type: 'Me too',
        },
      ],
    },
  ],
})
