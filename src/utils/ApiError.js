class ApiError extends Error {
    constructor(
        staticCode,
        message="Something went wrong",
        error = [],
        statck = ""
    ){
        super(message)
        this.staticCode = staticCode
        this.data = null
        this.message = message
        this.success = false;
        this.error =this.error

        if(stack){
            this.stack =stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}