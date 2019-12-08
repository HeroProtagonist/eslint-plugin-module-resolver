# module-resolver/use-alias

Allows you to enforce that aliased modules are not using relative paths.

## Rule Details

Given the babel configuration below

```json
...
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["."],
        "alias": {
          "action": "./actions"
        }
      }
    ]
  ]
...
```

The following patterns are considered warnings:

```js
import fetchData from '../../actions/fetchData'
```

```js
const fetchData = require('../../actions/fetchData')
```

```js
const fetchData = await import('../../actions/fetchData')
```

The following patterns are **not** considered warnings:

```js
import fetchData from 'actions/fetchData'
```

```js
const fetchData = require('actions/fetchData')
```

```js
const fetchData = await import('actions/fetchData')
```

## Rule Options

```json
...
"module-resolver/use-alias": [<enabled>, {
  "ignoreDepth": <number>,
  "projectRoot": <string>,
  "extensions": <array>,
  "allowDepthMoreOrLessThanEquality": <boolean>
}]
...
```

### `ignoreDepth`

Number representing a depth that can be ignored for aliased imports. Performs strict equality by default. If you want to allow depth of exact or lesser number, check `allowDepthMoreOrLessThanEquality`. By default this option is unused.

With the below `ignoreDepth` set, all of the above patterns causing warnings would no longer. The other cases would continue being valid as well.

```json
"module-resolver/use-alias": ["error", {
  "ignoreDepth": 2
}]
```

### `allowDepthMoreOrLessThanEquality`

Boolean `allowDepthMoreOrLessThanEquality` sets the equality rule for `ignoreDepth`. By default this option is unused (strict equality is performed).

With the below `allowDepthMoreOrLessThanEquality` set to `true`, all the pattern with depth equal or less than the `ignoreDepth` will be allowed.

```json
"module-resolver/use-alias": ["error", {
  "allowDepthMoreOrLessThanEquality": false
}]
```

### `projectRoot`

String representing a path from your workspace directory to your projectRoot directory where the `.babelrc` and `.eslintrc` files exist. By default this option is unused.

This is useful in a monorepo or projects that have these files nested in a subdirectory _(e.g. `<rootDir>/package/project/.eslintrc`)_.

```json
"module-resolver/use-alias": ["error", {
  "projectRoot": "/package/project"
}]
```

### `extensions`

Array of additional extensions to look for when linting. By default, files without extensions are considered to be `.js`. This expands the resolution for extensionless imports. Possible values are `.ts`, `.tsx`, and `.jsx`.

With the below `extensions` array, TypeScript files will also be resolved.

```json
"module-resolver/use-alias": ["error", {
  "extensions": [".ts"]
}]
```
