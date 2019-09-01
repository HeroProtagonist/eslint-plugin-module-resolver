const path = require('path')
const findProjectRoot = require('../../lib/helpers/find-project-root')

describe('findProjectRoot', () => {
  const filePath = path.normalize('/dev/monorepo/project/one/some/dir')
  const projectRootAbsolutePath = path.normalize('/dev/monorepo/project/one')

  it('is a function', () => {
    expect(findProjectRoot).toBeInstanceOf(Function)
  })

  it('returns null when no arguments are passed', () => {
    const root = findProjectRoot()
    expect(root).toBe(null)
  })

  it('returns null when invalid arguments are passed', () => {
    const invalid1 = findProjectRoot(95)
    const invalid2 = findProjectRoot(filePath, 8)
    const invalid3 = findProjectRoot(undefined, 8)
    expect(invalid1).toBe(null)
    expect(invalid2).toBe(null)
    expect(invalid3).toBe(null)
  })

  it('returns null when projectRoot option does NOT exist', () => {
    const prefix = findProjectRoot(filePath, 'cannot/be/found')
    expect(prefix).toBe(null)
  })

  it('returns absolute path for a nested project root', () => {
    const prefix = findProjectRoot(filePath, 'project/one')
    expect(prefix).toBe(projectRootAbsolutePath)
  })

  it('ignores leading slash on projectRoot option', () => {
    const prefix = findProjectRoot(filePath, '///project/one')
    expect(prefix).toBe(projectRootAbsolutePath)
  })

  it('ignores leading ./ on projectRoot option', () => {
    const prefix = findProjectRoot(filePath, './././project/one')
    expect(prefix).toBe(projectRootAbsolutePath)
  })

  it('ignores leading ../ on projectRoot option', () => {
    const prefix = findProjectRoot(filePath, '../../project/one')
    expect(prefix).toBe(projectRootAbsolutePath)
  })

  it('ignores trailing slash on projectRoot option', () => {
    const prefix = findProjectRoot(filePath, 'project/one/////')
    expect(prefix).toBe(projectRootAbsolutePath)
  })
})
