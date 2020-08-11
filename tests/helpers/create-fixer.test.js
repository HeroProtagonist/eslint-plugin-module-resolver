const createFixer = require('../../lib/helpers/create-fixer')

describe('createFixer', () => {
  it('is a function', () => {
    expect(createFixer).toBeInstanceOf(Function)
  })

  it('returns a null if no options are passed in', () => {
    expect(createFixer()).toBe(null)
  })
})
