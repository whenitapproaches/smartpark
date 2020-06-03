const mongoose = require('mongoose')
const joi = require('@hapi/joi')
const config = require('config')
const date_format = require('../helpers/date_format')
const time_format = require('../helpers/time_format')
const {History, HistorySchema} = require('../models/history')

const _getCarPlate = function(data) {
    let len = data.length
    var plate = data.toUpperCase()
    if(len == 7) {
        plate = [plate.slice(0, 3), "-", plate.slice(3, len)].join('')
        return plate
    }
    plate = [plate.slice(0, 3), "-", plate.slice(3, 6), '.', plate.slice(6,len)].join('')
    return plate
}

const _getOwner = (data) => data.toUpperCase()

const _getMembership = (data) => data.toUpperCase()

const CarSchema = mongoose.Schema({
    owner: {
        type: String,
        min: 5,
        max: 30,
        required: true,
        get: _getOwner
    },
    model: {
        type: String,
        max: 30
    },
    plate: {
        type: String,
        min: 7,
        max: 8,
        required: true,
        get: _getCarPlate
    },
    membership: {
        type: String,
        default: "basic",
        get: _getMembership
    },
    lastEntering: {
        type: Date
    },
    lastLeaving: {
        type: Date
    },
    isParking: {
        type: Boolean,
        default: false
    },
    slot: {
        type: String
    }
})

CarSchema.method("getLastEnteringDate", function() {
    if(!this.lastEntering) return 'N/A'
    let date = new Date(this.lastEntering.getTime() + config.get("GMT")*3600000)

    return date_format(date)
})
CarSchema.method("getLastLeavingDate", function() {
    if(!this.lastLeaving) return 'N/A'
    let date = new Date(this.lastLeaving.getTime() + config.get("GMT")*3600000)

    return date_format(date)
})
CarSchema.method("getTimeElapsed", function() {
    let dateInMs = new Date(this.lastEntering.getTime() + config.get("GMT")*3600000)
    let nowInMs = new Date().getTime()
    let timeElapsedInMs = nowInMs - dateInMs
    return time_format(timeElapsedInMs)
})
CarSchema.method("getParkingFee", function() {
    let dateInMs = new Date(this.lastEntering.getTime() + config.get("GMT")*3600000)
    let nowInMs = new Date().getTime()
    let timeElapsedInMs = nowInMs - dateInMs
    let minute = Math.floor(timeElapsedInMs/(1000*60))
    let pp = (this.membership == 'BASIC') ? config.get("app.price.basic") : config.get("app.price.premium")
    return minute*pp
})

const Car = mongoose.model("Car", CarSchema)

function validateCar(car){
    const schema = new joi.object({
        owner: joi.string().min(5).max(30).required(),
        model: joi.string().max(30),
        plate: joi.string().min(7).max(8).required(),
        membership: joi.string(),
        lastEntering: joi.date().allow('').optional(),
        lastLeaving: joi.date().allow('').optional(),
        isParking: joi.boolean(),
        slot: joi.string().allow('').optional()
    })
    return schema.validate(car)
}

exports.Car = Car
exports.validate = validateCar