export const errorHandler = (err, req, res, next) => {
  let statusCode = 500
  let message = "Internal Server Error"

  if (err.name === "ValidationError") {
    statusCode = 400
    message = Object.values(err.errors).map(val => val.message).join(", ")
  } else if (err.code && err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyValue)
    message = `Duplicate value for field: ${field}`
  } else if (err.name === "CastError") {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  } else if (err.statusCode && err.message) {
    statusCode = err.statusCode
    message = err.message
  }

  res.status(statusCode).json({
    success: false,
    message
  })
}
