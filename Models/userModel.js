const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

// name, email, password, confirmpassword, photo
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is a required field"]
    },
    email:{
        type: String,
        required: [true, 'Please enter an email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },
    photo:{
        type: String
    },role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password:{
        type: String,
        required: [true, "Please enter a password."],
        minlength: [8, "Password should be 8 characters long..."],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function(val){
                return val === this.password
            },
            message: "Password & confirm password doesnot match.." 
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordTokenResetExpire: Date
})


userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        return next()
    }
    
    //encrypt the password if modified
    this.password = await bcrypt.hash(this.password, 12)

    this.confirmPassword = undefined
    next()
})

userSchema.methods.comparePasswordInDb = async function(pswd){
   return await bcrypt.compare(pswd, this.password)
}


userSchema.methods.isPasswordChanged = async function(JWTTimestamp) {
    if(this.passwordChangedAt){
        
        const pswdChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

        return JWTTimestamp < pswdChangedTimestamp
    }
    return false
}

userSchema.methods.createResetPasswordToken = async function(){
    const resetToken =  crypto.randomBytes(32).toString('hex')
    
    this.passwordResetToken =  crypto.createHash('sha256').update(resetToken).digest('hex')

    this.passwordTokenResetExpire = Date.now() + 10 * 60 * 1000
    // console.log(resetToken, this.passwordResetToken)
    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User