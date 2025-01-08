class ApiError extends Error {
    constructor(
        staticCode,
        message = "Something went wrong",
        error = [],
        stack = ""
    ) {
        super(message);

        this.staticCode = staticCode;
        this.data = null;
        this.success = false;
        this.error = error;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
