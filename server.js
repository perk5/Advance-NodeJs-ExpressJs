const mongoose = require('mongoose')

const dotenv = require('dotenv')
dotenv.config({path: './config.env'})

process.on('uncaughtException', (err) => {
    console.log(err.message, err.name)
    process.exit(1) 
})

const app = require('./app')
// console.log(app.get('env'))
// console.log(process.env)
// console.log('NODE_ENV:', process.env.NODE_ENV);

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    console.log("DB connection Successful...")
}).catch((err) => {
    console.log("There is a problem connecting Database..")
})

// const movieSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Name is required field!'],
//         unique: true
//     },
//     description: String,
//     duration: {
//         type: Number,
//         required: [true, 'Duration is required field!']
//     },
//     ratings: {
//         type: Number,
//         default: 1.0
//     }
// })

// const Movie = mongoose.model('Movie', movieSchema)

// Movie.collection.dropIndex("duration_1")
//   .then(() => console.log("Dropped duration index"))
//   .catch(err => console.error("Index drop error:", err));

// const testMovie = new Movie({
//     name: 'Interstellar',
//     description: "A thrilling sci-fi movie with space adventure and great action.",
//     duration: 124
// })


// testMovie.save().then((doc) => {
//     console.log(doc)
// }).catch((error) => {
//     console.log(error.message)
// })
// Create a Server
const port = process.env.port || 3000;

const server = app.listen(port, () => {
    console.log("Server has Started..")
})

process.on('unhandledRejection', (err) => {
    console.log(err.message, err.name)
    console.log('Shutting down..')
    server.close(() => {
        process.exit(1)
    })
    
})



