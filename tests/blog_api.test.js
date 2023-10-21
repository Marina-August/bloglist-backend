const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
}, 15000)

test('blogs are returned as json', async () => {
  await api.get('/api/blogs')
    .expect('Content-Type', /application\/json/)
})

test('blogs have "id" as the unique identifier property', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => {
    expect(blog.id).toBeDefined()
  })
})


describe('creating a new blog', () => {
  test('a valid blog can be added with token', async () => {
    const newBlog = {
      title: 'Title1',
      author: 'Author1',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
      likes: 10
    }
    const token = await helper.getToken()

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain(
      'Title1'
    )
  }, 10000)

  test(' without token fails with 401 Unauthorized', async () => {
    const newBlog = {
      title: 'New Blog Title',
      author: 'Author Name',
      url: 'https://newblogexample.com',
      likes: 5
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401);

    const blogs = await helper.blogsInDb();

    expect(blogs).toHaveLength(helper.initialBlogs.length);
  }, 10000);

  test('missing "likes" property defaults to 0', async () => {
    const newBlog = {
      title: 'Title2',
      author: 'Author2',
      url: 'https://missinglikesurl.com',
    }

    const token = await helper.getToken()

    const response = await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog)

    expect(response.body.likes).toBe(0)
  })

  test('fails with status code 400 if title is missing', async () => {
    const newBlog = {
      author: 'Author Name',
      url: 'https://titleismissingexample.com',
      likes:8
    };

    const token = await helper.getToken()

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400);

    const blogs = await helper.blogsInDb()

    expect(blogs).toHaveLength(helper.initialBlogs.length)
  });

  test('fails with status code 400 if url is missing', async () => {
    const newBlog = {
      title: 'Blog Title',
      author: 'Author Name',
      likes: 10,
    };

    const token = await helper.getToken()

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400);

    const blogs = await helper.blogsInDb()

    expect(blogs).toHaveLength(helper.initialBlogs.length)
  });
});

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id and token are valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const token = await helper.getToken()

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

  test('fails with status code 401 if  token is invalid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const token = 123

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )

  })


  test('statuscode is 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    console.log(validNonexistingId)

    const token = await helper.getToken()

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '123'

    const token = await helper.getToken()

    await api
      .delete(`/api/blogs/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('updating of a blog', () => {
  test('succeeds with status code 200 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updatedBlog = { ...blogToUpdate, likes: 25 }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )

    const updatedBlogInDB = blogsAtEnd.find(blog => blog.id === blogToUpdate.id);
    expect(updatedBlogInDB.likes).toBe(25);
  })

  test('statuscode is 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()
    const updatedBlog = { title:'Soon will remove', author:'remove',url: 'https://remove.com', likes: 10 }

    console.log(validNonexistingId)

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send(updatedBlog)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '123'
    const updatedBlog = { title:'Invalid', author:'Invalid',url: 'https://invalid.com', likes: 10 }

    await api
      .put(`/api/blogs/${invalidId}`)
      .send(updatedBlog)
      .expect(400)
  })
})


afterAll(async () => {
  await mongoose.connection.close()
})
