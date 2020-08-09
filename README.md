# eslint-plugin-module-resolver

[![npm version](https://badge.fury.io/js/eslint-plugin-module-resolver.svg)](https://badge.fury.io/js/eslint-plugin-module-resolver)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-module-resolver.svg)](https://www.npmjs.com/package/eslint-plugin-module-resolver)
[![CircleCI](https://circleci.com/gh/HeroProtagonist/eslint-plugin-module-resolver.svg?style=shield)](https://app.circleci.com/pipelines/github/HeroProtagonist/eslint-plugin-module-resolver)
[![codecov](https://codecov.io/gh/HeroProtagonist/eslint-plugin-module-resolver/branch/master/graph/badge.svg)](https://codecov.io/gh/HeroProtagonist/eslint-plugin-module-resolver)

Warn when using relative paths to modules aliased using [babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```bash
yarn add --dev eslint
```

Next, install `eslint-plugin-module-resolver`:

```bash
yarn add --dev eslint-plugin-module-resolver
```

## Usage

Add `module-resolver` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["module-resolver"]
}
```

Then configure the rules you want to use under the rules section of `.eslintrc`.

```json
{
  "rules": {
    "module-resolver/use-alias": 2
  }
}
```

## Supported Rules

- [module-resolver/use-alias](docs/rules/use-alias.md) - Warn when aliased paths are using relative paths

# License

ESLint-plugin-module-resolver is licensed under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
