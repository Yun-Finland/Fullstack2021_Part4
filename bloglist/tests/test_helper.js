const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {      
    "title": "React patterns",
    "author": "Michael Chan",
    "url": "https://reactpatterns.com/",
    "likes": 7  
  },
  {      
    "title": "Go To Statement Considered Harmful",
    "author": "Edsger W. Dijkstra",
    "url": "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    "likes": 5
  }
]

const initialUsers = [
  {
    username: 'test1',
    name: 'test1 yun',
    password: 'test1_password'
  },
  {
    username: 'test2',
    name: 'test2 yun',
    password: 'test2_password'
  }
]

const blogsInDb = async () =>{
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async ()=>{
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const nonExistingId = async ()=>{
  const blog = new Blog({   
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,      
  })

  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

module.exports={
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb,
}