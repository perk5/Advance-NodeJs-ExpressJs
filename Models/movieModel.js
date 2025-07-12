const mongoose = require('mongoose')

const fs = require('fs')
const validator = require("validator")

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required field!'],
        unique: true,
        maxlength: [100, "Movie name must not have more than 100 characters"],
        minlength: [4, "Movie name must be 4 letters long"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required field"],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required field!']
    },
    ratings: {
        type: Number,
        validate: {
            validator: function(value){
                return value >= 1 && value <= 10
            },
            message: "Rating should be above 1 and below 10" 
        } 
    },
    totalRatings: {
        type: Number
    },
    releaseYear: {
        type: Number,
        required: [true, 'ReleaseYear is required field!']
    },
    releaseDate: {
        type: Date
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        select: false
    },
    genres:{
        type: [String],
        required: [true, 'Genres is required field!']
    },
    directors:{
      type: [String],
      required: [true, 'Genres is required field!']  
    },
    coverImage: {
        type: String,
        required: [true, 'CoverImage is required field!']  
    },
    actors:{
        type: [String],
        required: [true, 'Actors is required field!'] 
    },
    price:{
        type: Number,
        required: [true, 'Price is required field!']
    },
    createdBy: String
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

movieSchema.virtual('durationInHours').get(function(){
    hours = this.duration / 60
    return hours.toFixed(1)
})
// Executed before the document is saved in the DB
movieSchema.pre('save', function(next) {
    this.createdBy = 'PrerakShah'
    next()
})


// movieSchema.post('save', function(doc, next){

//     const content = `A new movie with name: ${doc.name} was created by a person name: ${doc.createdBy}\n`

//     fs.writeFileSync('./Log/log.txt', content, { flag: 'a' }, (err) => {
//         console.log(err.message)
//     })
//     next()
// })


movieSchema.pre(/^find/, function(next){
    this.find({ releaseDate: {$lte: Date.now()} })
    this.startTime = Date.now()
    next()
})

// movieSchema.post(/^find/, function(docs, next){
//     this.find({ releaseDate: {$gte: Date.now()} })
//     this.endTime = Date.now()
    
//     const content = `Query took: ${this.endTime - this.startTime} milliseconds\n`

//     fs.writeFileSync('./Log/log.txt', content, { flag: 'a' }, (err) => {
//         console.log(err.message)
//     })

//     next()
// })


movieSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { releaseDate: { $lte: new Date() } } })
    next()
})

const Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie