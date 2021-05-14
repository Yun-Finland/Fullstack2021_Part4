const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper.js')
const app = require('../app.js')
const api = supertest(app)
const Blog = require('../models/blog.js')
const User = require('../models/user.js')
const bcrypt = require('bcrypt')

beforeEach(async ()=> {
  await User.deleteMany({})   

  for (let user of helper.initialUsers){
    await api
      .post('/api/users')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }

  const usersAtStart = await helper.usersInDb()

  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs){
    let blogObject = new Blog(blog)
    blogObject.user = usersAtStart[0].id
    await blogObject.save()
  }

})

describe('when there is initially some blogs saved', ()=>{

  test('blogs are returned as json', async ()=>{
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('All blogs are returned', async()=>{
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titless = response.body.map(blog => blog.title)

    expect(titless).toContain('React patterns')
  })

})

describe('Viewing a specific blog', ()=>{

  test('Succeeds with a valid id', async ()=>{
    const blogsAtStart = await helper.blogsInDb()
    
    const blogToView = blogsAtStart[0]  

    expect(blogToView.id).toBeDefined()

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    expect(resultBlog.body).toEqual(processedBlogToView)

  })

  test('fails with statuscode 404 if blog does not exit', async ()=> {
    const validNoneExistingId = await helper.nonExistingId()
    await api
      .get(`/api/blogs/${validNoneExistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async ()=>{
    const invalidId = '5a3d5da59070081a82a3'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('add a new blog', ()=>{

  test('a valid blog can be added', async ()=>{
    const usersAtStart = await helper.usersInDb()

    const validUser = usersAtStart[0]

    const result = await api
      .post('/api/login')
      .send({username: 'test1', password: 'test1_password'})
      .expect(200)
      .expect('Content-Type',/application\/json/)
    
    const validToken = result.body.token    
  
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      user: validUser.id,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${validToken}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type',/application\/json/)  

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1 )

    const contents = blogsAtEnd.map( blog => blog.title)
    expect(contents).toContain('Canonical string reduction')
  })

  test('Likes Property will defult to 0 if missing', async ()=>{
    const usersAtStart = await helper.usersInDb()

    const validUser = usersAtStart[0]

    const result = await api
      .post('/api/login')
      .send({username: 'test1', password: 'test1_password'})
      .expect(200)
      .expect('Content-Type',/application\/json/)
    
    const validToken = result.body.token

    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      user: validUser.id
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${validToken}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length+1)

    const contents = blogsAtEnd.map( blog => blog.title)
    expect(contents).toContain('Canonical string reduction')

    const likesNumber = blogsAtEnd[helper.initialBlogs.length].likes
    expect(likesNumber).toEqual(0)
    
  })

  test('Blog without title and url will not be added', async ()=> {
    const usersAtStart = await helper.usersInDb()

    const validUser = usersAtStart[0]

    const result = await api
      .post('/api/login')
      .send({username: 'test1', password: 'test1_password'})
      .expect(200)
      .expect('Content-Type',/application\/json/)
    
    const validToken = result.body.token

    const newBlog = {
      author: "Edsger W. Dijkstra",
      likes: 7,
      user: validUser.id
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${validToken}`)
      .send(newBlog)
      .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('Adding a blog fails with the proper status code 401 Unauthorized if a token is not provided', async ()=>{
    
    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    }
  
    const result = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type',/application\/json/)  

    expect(result.body.error).toContain(`Unauthorized`)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
 
  })
})

describe('deletion of a blog', ()=>{

  test('succeeds with status code 204 if id is valid', async ()=>{

    const result = await api
      .post('/api/login')
      .send({username: 'test1', password: 'test1_password'})
      .expect(200)
      .expect('Content-Type',/application\/json/)
    
    const validToken = result.body.token 

    const blogsAtStart = await helper.blogsInDb()
    const blogToBeDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToBeDelete.id}`)
      .set('Authorization', `bearer ${validToken}`)
      .expect(204)
    
    const notesAtEnd = await helper.blogsInDb()
    expect(notesAtEnd).toHaveLength(helper.initialBlogs.length-1)

    const titles = notesAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(blogToBeDelete.title)
  })
})

describe('Update of a blog', ()=>{
  test('update likes of a blog', async ()=>{
    const blogsAtStart = await helper.blogsInDb()
    const blogToBeUpdate = blogsAtStart[0]

    const needsToUpdate =  {      
      "title": "React patterns",
      "author": "Michael Chan",
      "url": "https://reactpatterns.com/",
      "likes": 90
    }

    await api
      .put(`/api/blogs/${blogToBeUpdate.id}`)
      .send(needsToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtStart[0].likes).not.toEqual(blogsAtEnd[0].likes)
  })

})

describe('when there is initially one user in db', ()=>{
  beforeEach( async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User ({username: 'root', passwordHash})

    await user.save()
  })

  test('creation succeeds with a fresh username', async ()=> {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'test1',
      name: 'test1 yun',
      password: 'test1_password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with invalid username', async ()=>{
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 't2',
      name: 'test1 yun',
      password: 'test2_password'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type',/application\/json/)
    
    expect(result.body.error).toContain('User validation failed: username: Path `username` (`t2`) is shorter than the minimum allowed length (3).')
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with invalid password', async ()=>{
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'test2',
      name: 'test1 yun',
      password: 't2'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('password is shorter than minimum allowed length (3)')
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if username already taken', async ()=>{
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'test3',
      password: 'testpassword3'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    
    expect(result.body.error).toContain('`username` to be unique')
    
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)    
  })
})

afterAll(()=>{
  mongoose.connection.close()
})