const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username: 1, name:1})

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  
  if(blog){
    response.json(blog)
  }else{
    response.status(404).end()
  }
  
})

blogsRouter.post('/', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {

  const body = request.body

  const user = request.user

  const newBlog = new Blog ({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await newBlog.save()
  user.blogs = user.blogs.concat(savedBlog._id) 
  await user.save()

  response.json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', middleware.tokenExtractor, middleware.userExtractor, async (request, response) => {

  const blog = await Blog.findById(request.params.id)

  if(blog.user.toString() !== request.user.id.toString()){
    return response.status(401).json({error : 'you do not have the access to delete this blog'})
  }

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const updateBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, updateBlog, {new: true})
  response.json(updatedBlog)
})

module.exports = blogsRouter