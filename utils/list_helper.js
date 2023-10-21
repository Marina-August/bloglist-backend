const dummy = (blogs) => {
  return 1;
}

const totalLikes = (list) => {
  if(list.length === 0){
    return 0
  } else if (list.length === 1){
    return list[0].likes
  } else {
    let sum = 0
    for ( let i=0; i<list.length; i++){
      sum+=list[i].likes
    }
    return sum
  }
}

const favoriteBlog = (array) => {
  if (array.length === 0){
    return null
  } else if (array.length === 1){
    let favoriteBlog = { title:array[0].title, author: array[0].author, likes: array[0].likes }
    return favoriteBlog
  } else {
    let maxLikes = 0
    let maxObject = { title:'', author: '', likes:0 }
    for ( let i=0; i<array.length; i++){
      if (array[i].likes > maxLikes){
        maxLikes = array[i].likes
        maxObject = { title: array[i].title, author: array[i].author, likes: array[i].likes }
      }
    }
    return maxObject
  }
}

const mostBlogs =(array) => {
  let popularAuthor = { author: '', blogs: 0 }
  if (array.length === 0){
    return null
  } else if (array.length === 1){
    popularAuthor = { author: array[0].author, blogs: 1 }
    return popularAuthor
  } else {
    let authors = {};

    for (const item of array){
      if (item.author in authors) {
        authors[item.author]++;
      }
      else {
        authors[item.author] = 1;
      }
    }

    let maxBlogs = 0;
    for (const author in authors) {
      if (authors[author] > maxBlogs) {
        maxBlogs = authors[author];
        popularAuthor = {
          author: author,
          blogs: maxBlogs
        }
      }
    }
    return popularAuthor;
  }
}

const mostLikes = (array) => {
  let popularAuthor = { author: '', likes: 0 }
  if (array.length === 0){
    return null
  } else if (array.length === 1){
    popularAuthor = { author: array[0].author, likes: array[0].likes }
    return popularAuthor
  } else {
    let authors = {}
    for (const item of array){
      if (item.author in authors) {
        authors[item.author]+= item.likes;
      }
      else {
        authors[item.author] = item.likes;
      }
    }

    let maxlikes = 0;
    let popularAuthor = {};
    for (const author in authors) {
      if (authors[author] > maxlikes) {
        maxlikes = authors[author];
        popularAuthor = {
          author: author,
          likes: maxlikes
        }
      }
    }
    return popularAuthor;
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}

