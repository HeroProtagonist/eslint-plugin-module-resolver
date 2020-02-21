const findBabelConfig = require('find-babel-config')
const path = require('path')
const fs = require('fs')

const checkIgnoreDepth = require('../helpers/check-ignore-depth')
const findProjectRoot = require('../helpers/find-project-root')
const getProperties = require('../helpers/get-properties')

const checkPath = (path, ext) => fs.existsSync(`${path}${ext}`) || fs.existsSync(`${path}/index${ext}`)

const defaultExtensions = ['.js', '.jsx', '.es', '.es6', '.mjs'] // https://github.com/tleunen/babel-plugin-module-resolver/blob/77b1bc12a70d157218310b180a510084c418a16a/src/normalizeOptions.js#L13

module.exports = {
  meta: {
    docs: {
      description: 'Warn when using relative paths to modules aliased',
      category: 'Fill me in',
      recommended: false,
    },
    fixable: 'code', // or "code" or "whitespace"
    schema: [
      {
        type: 'object',
        properties: {
          ignoreDepth: {
            type: 'integer',
            minimum: 0,
          },
          allowDepthMoreOrLessThanEquality: {
            type: 'boolean',
          },
          projectRoot: {
            type: 'string',
          },
          extensions: {
            type: 'array',
            uniqueItems: true,
            items: {
              type: 'string',
              enum: ['.ts', '.tsx', '.jsx'],
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create: function(context) {
    const filename = context.getFilename()
    const filePath = path.dirname(filename)

    // Plugin options.
    const options = getProperties(context.options)
    const projectRootAbsolutePath = findProjectRoot(filePath, options.projectRoot)
    const cwd = projectRootAbsolutePath || process.cwd()
    const getFileAbsolutePath = p => path.join(cwd, p)
    const babelDir = projectRootAbsolutePath || '.'
    const { config } = findBabelConfig.sync(babelDir)
    let moduleResolverSettings = {}
    try {
      const validPluginNames = new Set(['babel-plugin-module-resolver', 'module-resolver'])
      const [moduleResolver] = config.plugins.filter(plugins => {
        if (Array.isArray(plugins) && validPluginNames.has(plugins[0])) {
          return plugins
        }
      })
      moduleResolverSettings = moduleResolver[1]
    } catch (error) {
      const message = 'Unable to find config for babel-plugin-module-resolver'
      return {
        ImportDeclaration(node) {
          context.report({ node, message, loc: node.source.loc })
        },
        CallExpression(node) {
          context.report({ node, message, loc: node.arguments[0].loc })
        },
      }
    }
    // Build array of alias paths.
    let aliasPaths = []

    if (typeof moduleResolverSettings.alias === 'object') {
      // get user defined aliases
      aliasPaths = Object.entries(moduleResolverSettings.alias).map(([alias, path]) => ({
        absolutePath: getFileAbsolutePath(path),
        alias,
      }))
    }

    if (Array.isArray(moduleResolverSettings.root)) {
      // get aliases based on root array
      const rootAbsolutePaths = moduleResolverSettings.root.map(root => ({
        rootPath: getFileAbsolutePath(root),
        root,
      }))
      const rootSubDirectories = rootAbsolutePaths
        .map(({ rootPath, root }) => ({
          rootPath,
          root,
          directories: fs.readdirSync(rootPath, { withFileTypes: true }),
        })) // create pairs root paths and it's content
        .map(({ rootPath, root, directories }) => ({
          // select only directories from path's content
          rootPath,
          root,
          directories: directories.filter(dirEntry => dirEntry.isDirectory()).map(dirEntry => dirEntry.name),
        }))
        .map(({ rootPath, root, directories }) =>
          directories.map(directory => ({
            absolutePath: path.join(rootPath, directory),
            alias: directory,
          })),
        ) // join directory names with it's root path and create aliases
        .reduce((flatDirEntries, dirEntires) => [...flatDirEntries, ...dirEntires], []) // flatten the array

      aliasPaths = [...aliasPaths, ...rootSubDirectories]
    }
    /**
     * Get supported extensions with following priority
     * - get extensions from eslint plugin configuration
     * - get extensions from babel plugin settings
     * - use default extensions supported by babel plugin
     */
    const extensionsSet =
      options.extensions !== undefined
        ? options.extensions
        : moduleResolverSettings.extensions !== undefined
        ? moduleResolverSettings.extensions
        : defaultExtensions

    const getAvaliableFix = ({ value, range, raw }) => {
      if (!value) return // template literals will have undefined value

      const { ignoreDepth, projectRoot, allowDepthMoreOrLessThanEquality } = options

      // Ignore if directory depth matches options.
      if (checkIgnoreDepth({ ignoreDepth, path: value, allowDepthMoreOrLessThanEquality })) return

      // Error if projectRoot option specified but cannot be resolved.
      if (projectRoot && !projectRootAbsolutePath) {
        return true
      }

      const resolvedPath = path.resolve(filePath, value)
      const pathExists =
        checkPath(resolvedPath, '') || extensionsSet.filter(ext => checkPath(resolvedPath, ext)).length > 0
      const matchingAlias = aliasPaths.find(({ absolutePath }) => resolvedPath.includes(absolutePath))

      if (matchingAlias !== undefined && pathExists && value.match(/\.\.\//)) {
        // matches, exists, and starts with ../
        return function(fixer) {
          const quoteType = raw.substr(0, 1)
          const aliasedPath = resolvedPath.replace(matchingAlias.absolutePath, matchingAlias.alias)
          return fixer.replaceTextRange(range, `${quoteType}${aliasedPath}${quoteType}`)
        }
      }
    }

    return {
      ImportDeclaration(node) {
        const fix = getAvaliableFix(node.source)
        if (fix !== undefined) {
          context.report({
            node,
            message: 'Do not use relative path for aliased modules',
            loc: node.source.loc,
            fix,
          })
        }
      },

      CallExpression(node) {
        const val = node.callee.name || node.callee.type
        if (val === 'Import' || val === 'require') {
          const fix = getAvaliableFix(node.arguments[0])
          if (fix !== undefined) {
            context.report({
              node,
              message: 'Do not use relative path for aliased modules',
              loc: node.arguments[0].loc,
              fix,
            })
          }
        }
      },
    }
  },
}
