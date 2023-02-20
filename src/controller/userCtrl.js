const User = require('../db/models/userModel')
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const { validateMongoId } = require('../utils/validateMongoId');
const { generateRefreshToken } = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('./emailCtr');

// ?? creating  User
const registerUser = asyncHandler(async (req, res) => {
    // console.log("yvuraj singh chouhan login")

    const email = req.body.email
    const findUser = await User.findOne({ email });

    if (!findUser) {
        const newUser = await User.create(req.body)
        res.json(newUser)
    }
    else {
        throw new Error('user already exist')
    }
})

// ??? login user if user Exists

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    //  check if user exist of not
    const findUser = await User.findOne({ email })

    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id)
        const updateUser = await User.findOneAndUpdate(findUser?._id, {
            refreshToken: refreshToken
        }, { new: true })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findUser?._id,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        })
    } else {
        throw new Error("Invalid credintials")
    }
})


// refresh Token

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh Token in cookie")
    const refreshToken = cookie.refreshToken

    const user = await User.findOne({ refreshToken })
    if (!user) throw new Error('No refresh token present in db or matched ')

    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id)
            throw new Error("There is somthing wrong with refresh token")
        else {
            const accessToken = generateToken(user?._id)
            res.json({ accessToken })
        }
    })
})

const logoutUser = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie.refreshToken) throw new Error("There is no refresh token in cookie")
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({ refreshToken })
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true
        })
        return res.sendStatus(204) // forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    res.sendStatus(204) // forbidden
})
// ?? Update User 

const updateUser = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user;
        validateMongoId(_id)
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        }, {
            new: true
        })
        res.json(updatedUser)
    } catch (error) {
        throw new Error(error)
    }
})


//  get all user 

const getAllUser = asyncHandler(async (req, res) => {

    try {
        const getUsers = await User.find({})
        res.json(getUsers)
    } catch (error) {
        throw new Error(error)
    }
});



//  ?? get Single User

const getUser = asyncHandler(async (req, res) => {
    try {
        const _id = req.params.id;
        validateMongoId(_id)
        const user = await User.findOne({ _id })
        res.json(user)
    } catch (error) {
        throw new Error(error)
    }
})

// ?? Delete the User
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const _id = req.params.id
        validateMongoId(_id)
        const user = await User.findByIdAndDelete(_id)
        res.json(user)
    } catch (error) {
        throw new Error(error)
    }
})


// ?? Block User

const blockUser = asyncHandler(async (req, res, next) => {
    const _id = req.params.id
    validateMongoId(_id)
    try {
        const block = await User.findByIdAndUpdate(_id, {
            isBlocked: true,
        }, {
            new: true,
        })
        res.json({
            message: "User is Blocked"
        })
    } catch (error) {
        throw new Error(error)
    }
})

const unblockUser = asyncHandler(async (req, res, next) => {
    const _id = req.params.id
    try {
        const unblock = await User.findByIdAndUpdate(_id, {
            isBlocked: false,
        }, {
            new: true,
        })
        res.json({
            message: "User is UnBlocked"
        })
    } catch (error) {
        throw new Error(error)
    }
})

// ?? update Password functionality
const updatePassword = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user
        const { password } = req.body
        validateMongoId(_id)
        const user = await User.findById(_id)
        console.log(password)
        if (password) {
            user.password = password
            const updatedPassword = await user.save()
            res.json(updatedPassword)
        }
        else {
            res.json(user)
        }
    } catch (error) {
        throw new Error(error)
    }
})


// ?? sending mail to the user to reset the password || frogot password functionality
const frogotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) throw new Error('Email is not valid no user found with this email')
    try {

        // generating token valid for 10 min
        const token = await user.createPasswordResetToken();
        await user.save()
        const resetURL = `Hey please follow this link to reset password .
        This link is valid for  10 min from now <a href="http//localhost:4000/api/user/reset-password/${token}">Click here</a>`

        //  users data passes to send the reset password link
        const data = {
            to: email,
            text: "Hey User",
            subject: "Forgot Password Link",
            html: resetURL,
        }
        // sending Email to the user using this function
        sendEmail(data);
        res.json(token)

    } catch (error) {
        throw new Error(error);
    }

})

module.exports = {
    registerUser, loginUser, getAllUser, getUser,
    deleteUser, updateUser, blockUser, unblockUser, handleRefreshToken, logoutUser, updatePassword , frogotPasswordToken
} 