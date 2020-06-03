const {History} = require('../models/history')
const app = require('express')
const router = app.Router()
const {Car, validate} = require('../models/car')
const auth = require('../middlewares/auth')
const config = require('config')
const date_format = require('../helpers/date_format')

router.get("/", auth, async (req,res) => {
    res.render("history", {
        activePage: "history"
    })
})

router.get("/all", auth, async (req,res) => {
    let reg = new RegExp(req.query.search, "i")
    await History.find().populate("_car", "membership model plate owner").sort("-leaveTime")
    .lean().exec((err, histories) => {
        if(histories) {
            histories.forEach((history) => {
                history.leaveTime = getLeaveTime(history.leaveTime)
                history.enterTime = getLeaveTime(history.enterTime)
                history._car.membership = history._car.membership.toUpperCase()
            })
            histories = histories.filter((his) => his._car.plate.match(reg) || his._car.owner.match(reg) || his._car.model.match(reg) || his._car.membership.match(reg))
            res.json(histories)
        }

    })
})

const getEnterTime = function(time) {
    if(!time) return 'N/A'
    let date = new Date(time.getTime() + config.get("GMT")*3600000)

    return date_format(date)
}
const getLeaveTime = function(time) {
    if(!time) return 'N/A'
    let date = new Date(time.getTime() + config.get("GMT")*3600000)

    return date_format(date)
}

module.exports = router