class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors = [],
        stack=""
    ){
        super(message);
        this.statusCode=statusCode;
        this.success=false;
        this.errors=errors;


        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,constructor)
        }
    }
}


throw new ApiError(404,"afdsafasdfasdf")