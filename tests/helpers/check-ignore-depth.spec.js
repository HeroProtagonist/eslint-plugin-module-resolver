const checkIgnoreDepth = require('../../lib/helpers/check-ignore-depth')

describe('checkIgnoreDepth', () => {
  it('is a function', () => {
    expect(checkIgnoreDepth).toBeInstanceOf(Function)
  })

  it('returns false when no arguments are passed', () => {
    const str = checkIgnoreDepth()
    expect(str).toBe(false)
  })

  it('returns false when invalid arguments are passed', () => {
    const invalid1 = checkIgnoreDepth({
      ignorePrefix: '../',
    })

    const invalid2 = checkIgnoreDepth({
      path: '../w',
    })

    const invalid3 = checkIgnoreDepth({
      path: '../www',
      ignore: '../',
    })

    expect(invalid1).toBe(false)
    expect(invalid2).toBe(false)
    expect(invalid3).toBe(false)
  })

  it('returns true if the path is at ignoreDepth', () => {
    const result1 = checkIgnoreDepth({
      ignoreDepth: 1,
      path: '../routes/index.js',
    })

    const result2 = checkIgnoreDepth({
      ignoreDepth: 2,
      path: '../../routes/index.js',
    })

    const result3 = checkIgnoreDepth({
      ignoreDepth: 3,
      path: '../../../routes/index.js',
    })

    expect(result1).toBe(true)
    expect(result2).toBe(true)
    expect(result3).toBe(true)
  })

  it('returns false if the path is not at ignoreDepth', () => {
    const result1 = checkIgnoreDepth({
      ignoreDepth: 1,
      path: '../../routes/index.js',
    })

    const result2 = checkIgnoreDepth({
      ignoreDepth: 2,
      path: '../../../routes/index.js',
    })

    const result3 = checkIgnoreDepth({
      ignoreDepth: 3,
      path: '../routes/index.js',
    })

    expect(result1).toBe(false)
    expect(result2).toBe(false)
    expect(result3).toBe(false)
  })

  it('returns correct boolean if the path returns a value less than or equal to ignoreDepth', () => {
    const result1 = checkIgnoreDepth({
      ignoreDepth: 1,
      path: '../../routes/index.js',
      allowDepthMoreOrLessThanEquality: true,
    })

    const result2 = checkIgnoreDepth({
      ignoreDepth: 2,
      path: '../../../routes/index.js',
      allowDepthMoreOrLessThanEquality: true,
    })

    const result3 = checkIgnoreDepth({
      ignoreDepth: 3,
      path: '../routes/index.js',
      allowDepthMoreOrLessThanEquality: true,
    })

    const result4 = checkIgnoreDepth({
      ignoreDepth: 2,
      path: '../../routes/index.js',
      allowDepthMoreOrLessThanEquality: true,
    })

    expect(result1).toBe(false)
    expect(result2).toBe(false)
    expect(result3).toBe(true)
    expect(result4).toBe(true)
  })
})
