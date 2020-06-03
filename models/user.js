const config = require('config')
const joi = require('@hapi/joi')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        min: 5,
        max: 30,
        required: true
    },
    password: {
        type: String,
        min: 5,
        max: 30,
        required: true
    }
}, {
    autoIndex: true
})

UserSchema.method("generateAuthToken", function() {
    return jwt.sign(this.username, config.get("privateKey"))
})

const User = mongoose.model("User", UserSchema)

function validateUser(user) {
    const schema = new joi.object({
        username: joi.string().min(5).max(30).required(),
        password: joi.string().min(5).max(30).required()
    })

    return schema.validate(user)
}

exports.User = User
exports.validate = validateUser