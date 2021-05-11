const list_helper = require('../utils/list_helper')

test('The value of function dummy should return 1', ()=>{
  const blog=[]
  const result = list_helper.dummy(blog)

  expect(result).toBe(1)
})

