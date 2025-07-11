const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

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
    }
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

userSchema.methods.comparePasswordInDb = async function(pswd, pswDB){
   return await bcrypt.compare(pswd, pswDB)
}

const User = mongoose.model('User', userSchema)

module.exports = User