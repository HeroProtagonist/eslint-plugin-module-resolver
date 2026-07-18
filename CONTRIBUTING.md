# Contributing

Contributions are welcome! See something that could be improved, feel free to create a pull request 👍

## Useful resources

- [Working with Plugins](https://eslint.org/docs/developer-guide/working-with-plugins) - ESLint docs section about plugins

- [AST Explore](https://astexplorer.net) - Tool to visualize [ASTs](https://en.wikipedia.org/wiki/Abstract_syntax_tree). Can create and test ESLint rules in the browser

- [Yeoman generator-eslint](https://github.com/eslint/generator-eslint) - Yeoman template for ESLint rules was used to bootstrap this repository

## Tool Versions

[Mise](https://mise.jdx.dev/) is used to manage node and yarn versions for this package. Follow the getting started [docs](https://mise.jdx.dev/getting-started.html).

## Development

Fork and clone the repo

```sh
git clone https://github.com/{username}/eslint-plugin-module-resolver
cd eslint-plugin-module-resolver

mise install
yarn
```

### Running tests

Run tests:

```sh
yarn test
```

Collect code coverage after test run:

```sh
yarn test:coverage
```

Run tests on file save:

```sh
yarn test:watch
```

### Building

Transpile `lib` to `dist` folder:

```sh
yarn build
```

Rebuild on changes in `lib`:

```sh
yarn build:watch
```

### Using local changes in an existing project

In eslint-plugin-module-resolver repository run:

```sh
yarn link
```

then in the project using the package run:

```sh
yarn link "eslint-plugin-module-resolver"
```

## Opening a pull request

- Fork the repo
- Branch off main
- Make sure all tests pass and create new ones if needed
- Reference any open issues that relate to the PR in the description
