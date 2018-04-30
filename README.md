[![npm version](https://badge.fury.io/js/eslint-plugin-module-resolver.svg)](https://badge.fury.io/js/eslint-plugin-module-resolver)
[![Build Status](https://travis-ci.org/HeroProtagonist/eslint-plugin-module-resolver.svg?branch=master)](https://travis-ci.org/HeroProtagonist/eslint-plugin-module-resolver)

# eslint-plugin-module-resolver

Warn when using relative paths to modules aliased using [babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver)

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-module-resolver`:

```
$ npm install eslint-plugin-module-resolver --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-module-resolver` globally.

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
        "module-resolver/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here





