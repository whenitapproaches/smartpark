const mongoose = require('mongoose')
const joi = require('@hapi/joi')


const HistorySchema = mongoose.Schema({
    enterTime: {
        type: Date,
        required: true
    },
    leaveTime: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    slot: {
        type: String,
        required: true
    },
    _car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car"
    },
    duration: {
        type: String,
        required: true
    }
})

const History = mongoose.model("History", HistorySchema)

exports.History = History
exports.HistorySchema = HistorySchema