const getProperties = require('../../lib/helpers/get-properties')

describe('getProperties', () => {
  it('is a function', () => {
    expect(getProperties).toBeInstanceOf(Function)
  })

  it('returns {} when no arguments are passed', () => {
    const emptyObj = getProperties()
    expect(emptyObj).toEqual({})
  })

  it('returns {} when invalid arguments are passed', () => {
    const invalid1 = getProperties({})

    const invalid2 = getProperties('hello')

    const invalid3 = getProperties(() => 1)

    expect(invalid1).toEqual({})
    expect(invalid2).toEqual({})
    expect(invalid3).toEqual({})
  })

  it('returns {} if options is an empty array', () => {
    const result = getProperties([])

    expect(result).toEqual({})
  })

  fit('returns first element of options array', () => {
    const option1 = [{foo: 'bar', one: 1}]
    const option2 = [{foo: 'bar', one: 1, two: 2}, 'more', 'items']

    const result1 = getProperties(option1)

    const result2 = getProperties(option2)

    expect(result1).toEqual(option1[0])
    expect(result2).toEqual(option2[0])
  })
})
