const CustomError = require("../Utils/CustomError")

const devErrors = (res, error) => {
    res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
            stachTrace: error.stack,
            error: error
        })
}


const castErrorHandler = (error) =>{
    const msg = `Invalid value for ${error.path}: ${error.value}`
    return new CustomError(msg, 400)
}

const duplicateId = (error) => {
    const msg = `Movie with the name ${error.keyValue.name} already exists..`
    return new CustomError(msg, 400)
}

const invalidValidation = (error) => {
    const message = Object.values(error.errors).map(el => el.message)
    const errorMessage = message.join('. ')
    return new CustomError(`Invalid input Data: ${errorMessage}`, 400 )
}


const prodErrors = (res, error) => {
    if (error.isOperational){
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message
        })
    }else{
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong! please try again Later...'
        })
    }
    
}

module.exports = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500
    
    error.status = error.status || "error" 
    
    if(process.env.NODE_ENV === "development"){
        devErrors(res, error)
    } else if (process.env.NODE_ENV === "production"){
        
        if(error.name === "CastError") error = castErrorHandler(error)
        if(error.code === 11000) error = duplicateId(error)
        if(error.name === "ValidationError") error = invalidValidation(error)
        
        prodErrors(res, error)
    }
}