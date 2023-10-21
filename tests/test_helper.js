const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    user: "6532a89d80b2c593d209596f"
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    user: "6532a89d80b2c593d209596f"
  },
  {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    user: "6532a89d80b2c593d209596f"
  },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({ title:'Soon will remove', author:'remove',url: 'https://remove.com', likes: 2 })
  await blog.save()
  await Blog.deleteOne({ _id: blog._id });

  return blog._id.toString()
}

const jwt = require('jsonwebtoken')

const getToken = async () => {
  const testUserName = 'UserName'
  const user = await User.findOne({ username: testUserName });
  const userForToken = {
    username: testUserName,
    id: user._id,
  }
  const token = jwt.sign(userForToken, process.env.SECRET)
  return token
}

module.exports = {
  initialBlogs, blogsInDb, nonExistingId, getToken
}