const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper.js')
const app = require('../app.js')
const api = supertest(app)
const Blog = require('../models/blog.js')

beforeEach(async ()=> {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs){
    let blogObject = new Blog(blog)
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

    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type',/application\/json/)  

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1 )

    const contents = blogsAtEnd.map( blog => blog.title)
    expect(contents).toContain('Canonical string reduction')
  })

  test('Likes Property will defult to 0 if missing', async ()=>{

    const newBlog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    }

    await api
      .post('/api/blogs')
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
    const newBlog = {
      author: "Edsger W. Dijkstra",
      likes: 7,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })
})

describe('deletion of a blog', ()=>{
  test('succeeds with status code 204 if id is valid', async ()=>{
    const blogsAtStart = await helper.blogsInDb()
    const blogToBeDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToBeDelete.id}`)
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

afterAll(()=>{
  mongoose.connection.close()
})