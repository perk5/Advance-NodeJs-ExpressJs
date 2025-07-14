const User = require('../Models/userModel')
const asyncErrorHandler = require('../Utils/AsyncErrorHandler')
const jwt = require('jsonwebtoken')
const CustomError = require('../Utils/CustomError')
const mongoose = require('mongoose')
const util = require('util')
const sendEmail = require('../Utils/Email.js')
const crypto = require('crypto')

const signtoken = (id) => {
    const token = jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
    return token
}

const filterReqObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(prop => {
        if(allowedFields.includes(prop)){
            newObj[prop] = obj[prop]
        }
    })
    return newObj
}

exports.getAllUsers = asyncErrorHandler(async(req, res, next) => {
    const user = await User.find({})

    res.status(200).json({
        status: "Success",
        data: {
            user
        }
    })
})

exports.updatePassword = asyncErrorHandler (async (req, res, next) => {
    // console.log(req.user)
    // 1. Find the user who wants to change the password
    const user = await User.findOne({ _id: req.user._id }).select('+password')
    if(!user){
        next( new CustomError(`User not found`, 404) )
    }
    //2. Check the current password...
    // const comparePassword = await user.comparePasswordInDb(req.body.password)
    // console.log(awaitcomparePassword)
    if(!(await user.comparePasswordInDb(req.body.password))){
       return next(new CustomError(`Your Current Password is not correct`, 401)) 
    }
    //3. Update the current password in the database..
    user.password = req.body.newPassword
    user.confirmPassword = req.body.comfirmPassword
    
    await user.save()
    //4. Login the User and send the webToken in the response...
    const Token = signtoken(user._id)
    
    res.status(200).json({
        status: "success",
        token: Token
    })
})


exports.updateMe = asyncErrorHandler( async (req, res, next) => {
    // 1. Check if the request data contains password | confirm password...
    if(req.body.password || req.body.comfirmPassword){
        return next(new CustomError(`You cannout update your password using this endpoint..`, 400))
    }
    console.log(req.user)
    // 2. Update User Details
    const filterObj = filterReqObj(req.body, 'name', 'email')
    const user = await User.findByIdAndUpdate(req.user._id, filterObj, { runValidators: true, new: true })
    
    res.status(200).json({
        status: "Updated",
        data: {
            user
        }
    })
})

exports.deleteMe = asyncErrorHandler( async (req, res, next) => {

    console.log(req.user)

    const user = await User.findByIdAndUpdate(req.user._id, {active: false})

    res.status(204).json({
        status: "Success",
        data: {
            user
        }
    })

})