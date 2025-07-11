const User = require('../Models/userModel')
const asyncErrorHandler = require('../Utils/AsyncErrorHandler')
const jwt = require('jsonwebtoken')
const CustomError = require('../Utils/CustomError')
const mongoose = require('mongoose')

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

    if (!user || !(await user.comparePasswordInDb(password, user.password))){
        const error = new CustomError('Incorrect Email or Password', 404)
        return next(error)
    }

    const token = signtoken(user._id)

    res.status(200).json({
        status: "success",
        token
    })

})