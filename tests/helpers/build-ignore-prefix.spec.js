const buildIgnorePrefix = require('../../lib/helpers/build-ignore-prefix')

describe('buildIgnorePrefix', () => {
  it('is a function', () => {
    expect(buildIgnorePrefix).toBeInstanceOf(Function)
  })

  it('returns null when no arguments are passed', () => {
    const prefix = buildIgnorePrefix()
    expect(prefix).toBe(null)
  })

  it('returns null when invalid arguments are passed', () => {
    const prefix = buildIgnorePrefix('invalid')
    expect(prefix).toBe(null)
  })

  it('returns ../ for an ignoreDepth of 1', () => {
    const prefix = buildIgnorePrefix(1)
    expect(prefix).toBe("../")
  })

  it('returns ../../ for an ignoreDepth of 2', () => {
    const prefix = buildIgnorePrefix(2)
    expect(prefix).toBe("../../")
  })
})
