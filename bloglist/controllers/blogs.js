const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response, next) => {
  Blog.find({})
    .then(blogs => {response.json(blogs)})
    .catch(error => next(error))
})

blogsRouter.get('/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then(blog =>{
      if(blog){
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

blogsRouter.post('/',(request, response, next) => {
  console.log(request.body)

  const body = request.body

  console.log(body)

  const newBlog = new Blog ({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  })

  newBlog.save()
    .then(savedBlog => {response.json(savedBlog.toJSON())})
    .catch(error => next(error))
})

blogsRouter.delete('/:id', (request, response, next) => {
  Blog.findByIdAndRemove(request.params.id)
    .then(()=> {
      response.status(204).end()
    })
    .catch(error => next(error))
})

blogsRouter.put('/:id',(request, response, next) => {
  const body = request.body

  const updateBlog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  Blog.findByIdAndUpdate(request.params.id, updateBlog, {new: true})
    .then( updatedBlog => {
      response.json(updatedBlog)
    })
    .catch( error => next(error))

})

module.exports = blogsRouter