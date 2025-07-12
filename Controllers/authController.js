const User = require('../Models/userModel')
const asyncErrorHandler = require('../Utils/AsyncErrorHandler')
const jwt = require('jsonwebtoken')
const CustomError = require('../Utils/CustomError')
const mongoose = require('mongoose')
const util = require('util')

const signtoken = (id) => {
    const token = jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
    return token
}

exports.signup = asyncErrorHandler (async (req, res, next) => {
    const newUser = await User.create(req.body)

    const token = signtoken(newUser._id)
    
    res.status(201).json({
        status: "success",
        token,
        data:{
            user: newUser
        }
    })
})

exports.login = asyncErrorHandler(async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    // const { email, password } = req.body
    
    if(!email || !password){
        const error = new CustomError(`Please provide email ID & password for login in`, 400)
        return next(error)
    }

    const user = await User.findOne({ email: email}).select('+password')

    // const isMatch = await user.comparePasswordInDb(password, user.password)

    if (!user || !(await user.comparePasswordInDb(password))){
        const error = new CustomError('Incorrect Email or Password', 404)
        return next(error)
    }

    const token = signtoken(user._id)

    res.status(200).json({
        status: "success",
        token
    })

})


exports.protect = asyncErrorHandler(async (req, res, next) => {

    // 1. Read the token and check if it exists
    const testToken = req.headers.authorization
    // console.log(testToken)
    let token;
    if(testToken && testToken.startsWith('Bearer')){
        token = testToken.split(' ')[1]
    }

    if(!token){
        const err =  new CustomError("You are not logged in..", 401)
        next(err)
    }

    //2. Validate that Token
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR)

    //3. Allow user to access route
    const user = await User.findById(decodedToken.id)

    if(!user){
        next(new CustomError('The user within given token does not exist', 401))
    }

    
    //If the user changed the password after the token was issued
    if(await user.isPasswordChanged(decodedToken.iat)){
        const error = new CustomError('You must login after the password change...', 401)
        return next(error)
    }

    req.user = user 
    // Allow the user to access the routes
    next()
})

exports.restrict = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role){
            next(new CustomError('You cannot delete as you are not authorised user', 403))  
        }
        next()
    }
    
}

// if multiple roles...

// exports.restrict = (...role) => {
//     return (req, res, next) => {
//         if (!role.includes(req.user.role)){
//             next(new CustomError('You cannot delete as you are not authorised user', 403))  
//         }
//         next()
//     }
    
// }

