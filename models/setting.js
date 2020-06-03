const mongoose = require('mongoose')
const joi = require('@hapi/joi')

const settingSchema = new mongoose.Schema({
    price: {
            premium: Number,
            basic: Number
    },
    sessionTimeout: {
        type: Number
    },
    currency: {
        type: String
    }
}, {
    capped: {
        size: 1024,
        max: 1
    }
})

const validate = (data) => {
    const schema = new joi.object({
        price: {
            premium: joi.number(),
            basic: joi.number()
        },
        sessionTimeout: joi.number(),
        currency: joi.string()
    })
    return schema.validate(data)
}

const Setting = mongoose.model("Setting", settingSchema)

exports.Setting = Setting
exports.validate = validate