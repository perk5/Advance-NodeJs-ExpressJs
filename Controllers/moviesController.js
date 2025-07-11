// const fs = require('fs')
// let movies = JSON.parse(fs.readFileSync('./data/movies.json', 'utf-8'))


const Movie = require('../Models/movieModel.js');
let movie = require('../Models/movieModel.js')
const ApiFeatures = require('../Utils/ApiFeatures.js')

const CustomError = require('../Utils/CustomError.js')

const asyncErrorHandler = require('../Utils/AsyncErrorHandler.js')
// Route Handler Functions

// async function getMovies(){
//     try{
//         const movies = await allMovies.find()
//         return movies
//     }catch(error){
//         console.log(error.message)
//     }
// }

// exports.checkId = (req, res, next, value) => {
//     let specificMovie = movies.find(movie => movie.id === value * 1)

//     if(!specificMovie){
//         return res.status(404).json({
//             status: "Failed",
//             message: "Id not found"
//         })
//     }

//     next()
// }

// exports.validateBody = (req, res, next) => {
//     if(!req.body.name || !req.body.duration){
//         return res.status(400).json({
//             status: "failed",
//             message: "Not a valid movie data..."
//         })
//     }
//     next()
// }


exports.getAllMovies = asyncErrorHandler(async (req, res, next) => {
    // Working With movies.json
        const features = new ApiFeatures(movie.find(), req.query).allMovies()
        let movies = await features.query;
    // If Want to Exclude extra queries from URL...
        
    /*const excludeFields = ["sort", "page", "limit", "fields"]

    excludeFields.forEach((el) => {
        delete queryObj[el]
    })
    console.log(queryObj)
    const movies = await movie.find(queryObj)*/

    //Making Shallow Copy
        /*let queryObj = {...req.query} 

        let queryOne = ["sort", "time", "fields"]

        queryOne.forEach(el => 
            delete queryObj[el]
        )*/

      

        // let queryStr = JSON.stringify(req.query)
        // queryStr = queryStr.replace(/\b(gte)\b/g, (match) => `$${match}`)
        // let obj = JSON.parse(queryStr)
        // let query = movie.find({})

        //Sorting Object
        // if (req.query.sort){
        //     const sortBy = req.query.sort.split(",").join(" ")
        //     query = query.sort(sortBy)
        // }else{
        //     query = query.sort('-duration').select('-__v')
        // }

        // // Limiting Fields
        // if(req.query.fields){
        //     //query.select()
        //     const fields = req.query.fields.split(',').join(" ")
        //     console.log(fields)
        //     query = query.select(fields)
        // }

        //Pagination
        // const page = req.query.page * 1|| 1;
        // const limit = req.query.limit * 1|| 10
        // const skip = (page - 1) * limit
        

        // if(req.query.page){
        //     const count = await movie.countDocuments()
        //     if (skip >= count){
        //         return res.json({
        //             status: "Failed to retrive."
        //         })
        //     }
        // }
        
        // if(req.query.limit){
        //     const count = await movie.countDocuments()
        //     if(req.query.limit > count){
        //         return res.status(404).json({
        //              status: "Failed to retrive."
        //         })
        //     }
        //     query = query.limit(req.query.limit).sort(req.query.sort)
        // }

        

        // const movies = await query
        
        res.status(200).json({
            status: "success",
            count: movies.length,
            data: {
                movies
            }
    
})
})

exports.getSpecificMovie = asyncErrorHandler ( async (req, res, next) => {
        
        let id = req.params.id
    
        const array = await movie.findById(id)

        if (!array){
            const error = new CustomError('Movie not found', 404)
            return next(error)
        }

        res.status(200).json({
            status: "Success",
            data: {
                array
            }
        })
    // Working With movies.json

    // const movieId = req.params.id * 1
    // let specificMovie = movies.find(movie => movie.id === movieId)

    // // if(!movie){
    // //     return res.status(404).json({
    // //         status: "Fail",
    // //         message: `Movie with Id ${movieId} not found..!!`
    // //     })
    // // }

    // res.status(200).json({
    //     status: "Success",
    //     data: {
    //         movie: specificMovie
    //     }
    // })
 // res.send("Test Movie..")

})



exports.addNewMovie = asyncErrorHandler (async (req, res, next) => {
    // Working With movies.json

    // const newId = movies[movies.length - 1].id + 1
    // const newMovie = Object.assign({id: newId}, req.body)
    // movies.push(newMovie)
    // fs.writeFile('./data/movies.json', JSON.stringify(movies), (err) => {
    //     res.status(201).json({
    //         status: "Success",
    //         count : movies.length,
    //         data: {
    //             movie: newMovie
    //         }
    //     })
    // })
    // res.send("Created..")

    // const addNewMovie = new movie({ })
    // addNewMovie.save()
    
   
        // console.log("Request Body Received:", req.body);
    const createMovie = await movie.create(req.body)
    
    res.status(201).json({
        status: "Success",
        message: "Created Successfully.",
        data:{
            createMovie
        }
    })
})

exports.updateMovie = asyncErrorHandler( async (req, res, next) => {

    // Working With movies.json
    // let id = req.params.id * 1

    // // let specificMovie = movies.find(movie => movie.id === id)

    // // if(!specificMovie){
    // //     return res.json({
    // //         status: "Failed",
    // //         message: "Id not found"
    // //     })
    // // }

    // let updatedMovie = movies.map((movie) => {
    //     if(movie.id !== id){
    //         return movie
    //     }else{
    //         return Object.assign({id: id}, req.body)
    //     }
    // })
    // fs.writeFile('./data/movies.json', JSON.stringify(updatedMovie), (err) => {
    //     if(err){
    //         return res.status(404).send("Error Updating")
    //     }
    //     res.status(200).send("Updated")
    // })

        let id = req.params.id
        const array = await movie.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

        if (!array){
            const error = new CustomError('Could not update Movie', 404)
            return next(error)
        }

        res.status(200).json({
            status: "Success",
            data:{
                array: array
            }
        })
})

exports.deleteMovie = asyncErrorHandler (async (req, res, next) => {
        const deleteMovie = await movie.findByIdAndDelete(req.params.id)

        if (!deleteMovie){
            const error = new CustomError('Movie with that Id is not found..', 404)
            return next(error)
        }
        res.status(200).json({
            status: "Success",
            message: "Movie Deleted.",
            data:{
                array: deleteMovie
            }
        })
})

exports.getMovieStats = asyncErrorHandler( async (req, res, next) => {
        const stats = await Movie.aggregate([
            { $match: { ratings: {$gte: 4.5} } },
            { $group: { 
                _id: '$releaseYear',
                avgRating: { $avg: '$ratings' },
                sum: { $sum: '$price' },
                minPrice: { $min: '$price' },
                count: { $sum: 1 }
            }},
            { $sort: { 
                sum: -1
            }}
        ])

        res.status(200).json({
            status: 'Success',
            count: stats.length,
            data: {
                stats: stats
            }
        })
})


exports.getMovieByGenre = asyncErrorHandler ( async (req, res, next) => {
        const genre = req.params.genre
        const movies = await movie.aggregate([
            { $unwind : "$genres"},
            { $group: { 
                _id: '$genres',
                movieCount: { $sum: 1 },
                name: 
                    { $push: "$name" }
             }},
             { $addFields: { genres: "$_id" } },
             { $project: { _id: 0 } },
             { $sort: { movieCount:  -1} },
             { $match: { genres:  genre} }
             

        ])
        res.status(200).json({
            status: 'Success',
            count: movies.length,
            data: {
                movies: movies
            }
        })
    
})
    
    // Working With movies.json

    // let id = req.params.id * 1
    // let specificMovie = movies.find(movie => movie.id === id)

    // // if(!movie){
    // //     return res.status(404).send("Movie not found")
    // // }

    // let deletedMovie = movies.filter((singleMovie) => {
    //     return singleMovie.id !== specificMovie.id
    // })

    // fs.writeFile('./data/movies.json', JSON.stringify(deletedMovie), (err) => {
    //     res.status(200).json({
    //         status: "Success",
    //         data: {
    //             movie: deletedMovie
    //         }
    //     })
    // }}
