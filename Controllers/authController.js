const User = require('../Models/userModel')
const asyncErrorHandler = require('../Utils/AsyncErrorHandler')
const jwt = require('jsonwebtoken')
const CustomError = require('../Utils/CustomError')
const mongoose = require('mongoose')
const util = require('util')
const sendEmail = require('../Utils/Email.js')
const crypto = require('crypto')


exports.createSendResponse = (user, statusCode, res) => {
    const token = signtoken(user._id)

    const options = {
        maxAge: 2592000000,
        httpOnly: true
    }

    if(process.env.NODE_ENV === "production"){
        options.secure = true
    }
    
    res.cookie('jwt', token, options)

    user.password = undefined

    res.status(statusCode).json({
        status: "success",
        token,
        data:{
            user
        }
    })
}

const signtoken = (id) => {
    const token = jwt.sign({ id }, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
    return token
}

exports.signup = asyncErrorHandler (async (req, res, next) => {
    const user = await User.create(req.body)

    exports.createSendResponse(user, 200, res)
    
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

    exports.createSendResponse(user, 200, res)

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

exports.forgotPassword = asyncErrorHandler( async (req, res, next) => {
    //1. Get User based on posted E-mail...
    const user = await User.findOne({ email: req.body.email })

    if(!user){
        const error = new CustomError('We could not find the user with given email', 404)
        next(error)
    }

    //2. Generate and Reset Token
    const resetToken = await user.createResetPasswordToken()
    // console.log(resetToken)

    await user.save({ validateBeforeSave: false })

    //3. Send the token back to the user email...
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`
    const message =`We have received a password reset request. Please use the below link to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid for 10 minutes`
    
    try{
        await sendEmail({
        email: user.email,
        subject: "Password change request received",
        message: message
    })

        res.status(200).json({
            status: "Success",
            message: "Password reset link send to the user email.."
        })
    }catch(error){
        user.passwordResetToken= undefined
        user.passwordTokenResetExpire= undefined
        await user.save({ validateBeforeSave: false })

        return next(new CustomError(`There was an error sending password reset email. Please try again later`, 500))
    }
    
})

exports.resetPassword = asyncErrorHandler( async (req, res, next) => {
    const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({ passwordResetToken: token, passwordTokenResetExpire: { $gt: Date.now() } })
     
    if(!user){ 
        next(new CustomError( `The token is invalid or has expired..`, 400))
    }
    // new reset passwords 
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    user.passwordResetToken= undefined
    user.passwordTokenResetExpire= undefined
    user.passwordChangedAt = Date.now()

    await user.save()
    
    exports.createSendResponse(user, 200, res)
})

