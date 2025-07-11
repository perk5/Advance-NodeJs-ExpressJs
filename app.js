//Import Express Package....
const express = require('express')
const morgan = require('morgan')
const movieRouter = require('./Routes/moviesRoutes')
const userRouter = require('./Routes/authRouter')
const CustomError = require('./Utils/CustomError')
const globalHandlerFunction = require('./Controllers/errorController')

let app = express()
app.use(express.json())

const qs = require("qs");
app.set("query parser", (str) => qs.parse(str));
// if(process.env.NODE_ENV === "development"){
//     app.use(morgan('dev'))
// }

// 
// Import Router Files

app.use(express.static('./public'))

// app.use((req, res, next) => {
//     req.requestedAt = new Date().toISOString();
//     next()
// })

//GET - api/v1/movies
// app.get('/api/v1/movies', getAllMovies)
// //GET - Specific Movie
// app.get('/api/v1/movies/:id', getSpecificMovie)
// //POST - api/Movies
// app.post('/api/v1/movies', addNewMovie)
// //PUT -- api/v1/movies
// app.put('/api/v1/movies/:id', updataMovie)
// //Delete -- Query...
// app.delete('/api/v1/movies/:id', deleteMovie)


app.use('/api/v1/movies', movieRouter)
app.use('/api/v1/users', userRouter)

app.use((req, res, next) => {
//   res.status(404).json({
//     status: "Failed",
//     message: `Can't find ${req.originalUrl} on the server`
//   });

    // const err = new Error(`Can't find ${req.originalUrl} on the server`)
    // err.status = "Fail"
    // err.statusCode = 404

    const err = new CustomError(`Can't find ${req.originalUrl} on the server`, 404)
    next(err)
});

app.use(globalHandlerFunction)


// app.use((error, req, res, next) => {
//     error.statusCode = error.statusCode || 500
//     error.status = error.status || 'error'
//     res.status(error.statusCode).json({
//         status: error.statusCode,
//         message: error.message
//     })
// })

module.exports = app 