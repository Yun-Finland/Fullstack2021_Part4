const list_helper = require('../utils/list_helper')

describe('total likes', ()=>{
  const listWithOneBlog = [
    {
      _id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
      __v: 0
    }     
  ]

  test('when list has only one blog, equals the likes of that', ()=>{
   
    const result = list_helper.totalLikes(listWithOneBlog)

    expect(result).toBe(7)
  })
})