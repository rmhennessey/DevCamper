const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User')

// Protect routes

exports.protect = asyncHandler(async (req, res, next) => {
    // This allows us to get the token from the headers
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1]; // bc of the formatting of the "Bearer token", this turns this into an array, splitting at the space (' '). We then grab the second item in the array which is the token.
    }

    // else if(req.cookies.token) {
    //     token = req.cookies.token
    // }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }

    try {
        // Verify token by extracting payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded)

        req.user = await User.findById(decoded.id); // this will always be the logged in user

        next()
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }
})

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) { //the req.user is getting set above in the protect middleware
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403))
        }
        next();
    }
}