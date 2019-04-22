[![npm version](https://badge.fury.io/js/eslint-plugin-module-resolver.svg)](https://badge.fury.io/js/eslint-plugin-module-resolver)
[![Build Status](https://travis-ci.com/HeroProtagonist/eslint-plugin-module-resolver.svg?branch=master)](https://travis-ci.com/HeroProtagonist/eslint-plugin-module-resolver)

# eslint-plugin-module-resolver

Warn when using relative paths to modules aliased using [babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ yarn add --dev eslint
```

Next, install `eslint-plugin-module-resolver`:

```
$ yarn add --dev eslint-plugin-module-resolver
```

## Usage

Add `module-resolver` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "module-resolver"
    ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "module-resolver/use-alias": 2
    }
}
```

## Supported Rules

* **use-alias** - Warn when aliased paths are using relative paths
