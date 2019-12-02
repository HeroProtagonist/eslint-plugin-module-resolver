const findBabelConfig = require('find-babel-config')
const path = require('path')
const fs = require('fs')

const checkIgnoreDepth = require('../helpers/check-ignore-depth')
const findProjectRoot = require('../helpers/find-project-root')
const getProperties = require('../helpers/get-properties')

const values = Object.values || (obj => Object.keys(obj).map(e => obj[e]))
const checkPath = (path, ext) =>
  fs.existsSync(`${path}${ext}`) || fs.existsSync(`${path}/index${ext}`)

module.exports = {
  meta: {
    docs: {
      description: 'Warn when using relative paths to modules aliased',
      category: 'Fill me in',
      recommended: false,
    },
    fixable: "code", // or "code" or "whitespace"
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
    // Find alias via babel-plugin-module-resolver config.
    let aliasPaths = []
    const babelDir = projectRootAbsolutePath || '.'
    const { config } = findBabelConfig.sync(babelDir)
    try {
      const validPluginNames = new Set(['babel-plugin-module-resolver', 'module-resolver'])
      const [moduleResolver] = config.plugins.filter(plugins => {
        if (Array.isArray(plugins) && validPluginNames.has(plugins[0])) {
          return plugins
        }
      })
      const moduleResolverSettings = moduleResolver[1]

      console.log(moduleResolver)
      if (typeof moduleResolverSettings.alias === 'object') {
        aliasPaths = values(moduleResolverSettings.alias).map(getFileAbsolutePath)
      }
      if (Array.isArray(moduleResolverSettings.root)) {
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
    } catch (error) {
      console.log(error)
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
    console.log('#####', aliasPaths, '######')
    // Build array of alias paths.


    const hasError = val => {
      if (!val) return // template literals will have undefined val

      const { ignoreDepth, projectRoot, extensions } = options

      // Ignore if directory depth matches options.
      if (checkIgnoreDepth({ ignoreDepth, path: val })) return

      // Error if projectRoot option specified but cannot be resolved.
      if (projectRoot && !projectRootAbsolutePath) {
        return true
      }
      console.log('@@@@ Check for errors')
      console.log(filePath, val)
      const resolvedPath = path.resolve(filePath, val)
      console.log('resolvedPath', resolvedPath)
      const resolvedExt = path.extname(val) ? '' : '.tsx' // TODO support all extensions from settings
      console.log('resolvedExt', resolvedExt)
      let pathExists = checkPath(resolvedPath, resolvedExt)
      console.log('pathExists', pathExists)
      if (extensions && !pathExists) {
        pathExists = extensions.filter(ext => checkPath(resolvedPath, ext)).length
      }

      const isAliased = aliasPaths.some(aliasPath => resolvedPath.includes(aliasPath))
      return isAliased && pathExists && val.match(/\.\.\//) // matches, exists, and starts with ../
    }

    return {
      ImportDeclaration(node) {
        console.log('ImportDeclaration')
        if (hasError(node.source.value)) {
          context.report({
            node,
            message: 'Do not use relative path for aliased modules',
            loc: node.source.loc,
            fix: function (fixer) {
              // return fixer.insertTextAfter(node, ";");
              console.log(node)
              return fixer.replaceTextRange(node.source.range, `'src/components/Component'`);
            }
          })
        }
      },

      CallExpression(node) {
        console.log('callExpression')
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
