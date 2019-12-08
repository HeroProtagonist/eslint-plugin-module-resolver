const findBabelConfig = require('find-babel-config')
const path = require('path')
const fs = require('fs')

const checkIgnoreDepth = require('../helpers/check-ignore-depth')
const findProjectRoot = require('../helpers/find-project-root')
const getProperties = require('../helpers/get-properties')

const values = Object.values || (obj => Object.keys(obj).map(e => obj[e]))
const checkPath = (path, ext) =>
  fs.existsSync(`${path}${ext}`) || fs.existsSync(`${path}/index${ext}`)

const defaultExtensions = ['.js', '.jsx', '.es', '.es6', '.mjs']; // https://github.com/tleunen/babel-plugin-module-resolver/blob/77b1bc12a70d157218310b180a510084c418a16a/src/normalizeOptions.js#L13

module.exports = {
  meta: {
    docs: {
      description: 'Warn when using relative paths to modules aliased',
      category: 'Fill me in',
      recommended: false,
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      {
        type: 'object',
        properties: {
          ignoreDepth: {
            type: 'number',
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

  create: function (context) {
    const filename = context.getFilename()
    const filePath = path.dirname(filename)

    // Plugin options.
    const options = getProperties(context.options)
    const projectRootAbsolutePath = findProjectRoot(filePath, options.projectRoot)
    const cwd = projectRootAbsolutePath || process.cwd()
    const getFileAbsolutePath = ((p) => path.join(cwd, p))
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

    if (typeof moduleResolverSettings.alias === 'object') { // get user defined aliases
      aliasPaths = values(moduleResolverSettings.alias).map(getFileAbsolutePath)
    }

    if (Array.isArray(moduleResolverSettings.root)) { // get aliases based on root array
      const rootAbsolutePaths = moduleResolverSettings.root.map(getFileAbsolutePath)
      const rootSubDirectories = rootAbsolutePaths
        .map((rootPath) => ({ rootPath, directories: fs.readdirSync(rootPath, { withFileTypes: true }) })) // create pairs root paths and it's content
        .map((dirEntires) => ({ // select only directories from path's content
          rootPath: dirEntires.rootPath,
          directories: dirEntires.directories
            .filter((dirEntry) => dirEntry.isDirectory())
            .map((dirEntry) => dirEntry.name)
        }))
        .map(({ rootPath, directories }) => directories.map((directory) => path.join(rootPath, directory))) // join directory names with it's root path
        .reduce((flatDirEntries, dirEntires) => ([...flatDirEntries, ...dirEntires]), []) // flatten the array

      aliasPaths = [...aliasPaths, ...rootSubDirectories]
    }

    /**
     * Get supported extensions with following priority
     * - get extensions from eslint plugin configuration
     * - get extensions from babel plugin settings
     * - use default extensions supported by babel plugin
     */
    const extensionsSet = options.extensions !== undefined
      ? options.extensions
      : moduleResolverSettings.extensions !== undefined
        ? moduleResolverSettings.extensions
        : defaultExtensions

    const hasError = val => {
      if (!val) return // template literals will have undefined val

      const { ignoreDepth, projectRoot, extensions } = options

      // Ignore if directory depth matches options.
      if (checkIgnoreDepth({ ignoreDepth, path: val })) return

      // Error if projectRoot option specified but cannot be resolved.
      if (projectRoot && !projectRootAbsolutePath) {
        return true
      }

      const resolvedPath = path.resolve(filePath, val)
      const pathExists = checkPath(resolvedPath, '') || extensionsSet.filter(ext => checkPath(resolvedPath, ext)).length > 0
      const isAliased = aliasPaths.some(aliasPath => resolvedPath.includes(aliasPath))
      
      return isAliased && pathExists && val.match(/\.\.\//) // matches, exists, and starts with ../
    }

    return {
      ImportDeclaration(node) {
        if (hasError(node.source.value)) {
          context.report({
            node,
            message: 'Do not use relative path for aliased modules',
            loc: node.source.loc,
          })
        }
      },

      CallExpression(node) {
        const val = node.callee.name || node.callee.type
        if (val === 'Import' || val === 'require') {
          hasError(node.arguments[0].value) &&
            context.report({
              node,
              message: 'Do not use relative path for aliased modules',
              loc: node.arguments[0].loc,
            })
        }
      },
    }
  },
}
