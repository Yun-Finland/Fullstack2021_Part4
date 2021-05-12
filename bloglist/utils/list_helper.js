
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum += blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((mostLikesBlog, blog) => {

    if(blog.likes > mostLikesBlog.likes){
      mostLikesBlog = blog
    }

    return mostLikesBlog

  },blogs[0]
  )}

/*
const mostBlogs = (blogs)=>{

  const blogListByAuthor = blogs
    .reduce((authorList, blog) =>{

      authorList[blog.author] = authorList[blog.author] ? authorList[blog.author].concat(blog) : [].concat(blog)

      console.log('After:', authorList)

      return authorList
    },[])   

  return blogListByAuthor
}
*/

/*
const mostBlogs = (blogs) =>{
  const authorAndBlogs = blogs
    .reduce((newList, blog) => {
      newList[blog.author] = newList[blog.author] ? (blog.likes + newList[blog.author]) : blog.likes

      console.log('After', newList)
      return newList
    }, [])
  
  return authorAndBlogs
}
*/

const mostBlogs = (blogs) =>{

  const mostBlogsAuthor = {author: "", blogs: 0}

  const authorAndBlogs = blogs
    .reduce((newList, blog) => {
      newList[blog.author] = newList[blog.author] ? ( newList[blog.author] + 1 ) : 1
      return newList
    }, {})

  for (const [key, value] of Object.entries(authorAndBlogs)){
    
    if(value > mostBlogsAuthor.blogs){
      mostBlogsAuthor.author = key,
      mostBlogsAuthor.blogs = value
    }
  }  
  
  return mostBlogsAuthor
}

const mostLikes = (blogs) => {
  const mostLikesAuthor = {author: "", likes: 0}

  const authorAndBlogs = blogs
    .reduce((newList, blog) => {
      newList[blog.author] = newList[blog.author] ? ( blog.likes + newList[blog.author] ) : blog.likes
      return newList
    }, {})

  for (const [key, value] of Object.entries(authorAndBlogs)){
    
    if(value > mostLikesAuthor.likes){
      mostLikesAuthor.author = key,
      mostLikesAuthor.likes = value
    }
  }  
  
  return mostLikesAuthor
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}