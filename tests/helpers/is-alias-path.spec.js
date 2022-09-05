const isAliasPath = require('../../lib/helpers/is-alias-path')

jest.mock('path', () => ({ sep: '/' }))

describe('isAliasPath', () => {
  it('returns true for aliased module imports', () => {
    expect(isAliasPath('./src/service', './src/service')).toBe(true)
  })

  it('returns true for aliased module subpath imports', () => {
    expect(isAliasPath('./src/service/foo-bar', './src/service')).toBe(true)
  })

  it('returns false for shared prefix collisions', () => {
    expect(isAliasPath('./src/services', './src/service')).toBe(false)
  })
})
