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
  "extensions": <array>
}]
...
```

### `ignoreDepth`

Number representing a depth that can be ignored for aliased imports. By default this option is unused.

With the below `ignoreDepth` set, all of the above patterns causing warnings would no longer. The other cases would continue being valid as well.

```json
"module-resolver/use-alias": ["error", {
  "ignoreDepth": 2
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
