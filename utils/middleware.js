const logger = require('./logger')
const jwt = require('jsonwebtoken')

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.message === `Information has already been removed from server.`) {
    return response.status(404).json({ error: error.message })
  } else if (error.message === 'Password is less than 3 symbols.'){
    return response.status(400).json({ error: error.message })
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: error.message })
  }else if (error.message ===  'Permission denied. Can delete own blogs only!') {
    return response.status(403).json({ error: error.message })
  }else if (error.message === `Blog not found!`) {
    return response.status(404).json({ error: error.message })
  }
  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.substring(7);
    request.token = token
  }

  next()
}

const userExtractor = (request, response, next) => {
  const token = request.token
  if(token){
    const decodedToken = jwt.verify(token, process.env.SECRET)
    request.user = decodedToken.id
  }
  next()
}

module.exports = {
  errorHandler, tokenExtractor, userExtractor
}