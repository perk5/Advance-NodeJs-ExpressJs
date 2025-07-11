const mongoose = require("mongoose")
const dotenv = require("dotenv")
const fs = require("fs")
const movie = require('../Models/movieModel.js')

dotenv.config({path: './config.env'})

mongoose.connect(process.env.CONN_STR, {
    useNewUrlParser: true
}).then((conn) => {
    console.log("Connected")
}).catch((err) => { 
    console.log(err)
})

// Read Movies.json file
const movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'))

// Delete Existing Movie Documents from the collection
const deleteMovies = async () =>{
    try{
        await movie.deleteMany()
        console.log("Data Successfully Deleted...")
    }catch(err){
        console.log(err.message)
    }
    process.exit()
}

// Importing Movies Data to Mongodb collection

const importMovies = async () => {
    try{
        await movie.create(movies)
        console.log("Data Successfully imported..!!")
    }catch(err){
        console.log(err.message)
    }
    process.exit()
    
}

if(process.argv[2] === '--import'){
    importMovies()
}

if(process.argv[2] === '--delete'){
    deleteMovies()
}

// deleteMovies()
// importMovies()