const {Car, validate} = require('../models/car')
const {History} = require('../models/history')
const app = require('express')
const router = app.Router()
const auth = require('../middlewares/auth')
const EJS = require('ejs')

router.get("/", auth, async function(req, res) {
    res.render("car", {
        activePage: 'cars'
    })
})

router.get("/all", auth, async function(req,res) {
    let query = {}
    switch(req.query.isParkingOptions){
        case '0':
            query.isParking = false
            break
        case '1':
            query.isParking = true
            break
        case '2':
            break
        default:
    }
    if(req.query.search) {
        let reg = new RegExp(req.query.search, "i")
        query.$or = [
            {
                plate: reg
            },
            {
                owner: reg
            },
            {
                model: reg
            },
            {
                membership: reg
            },
            {
                slot: reg
            }
        ]
    }
    let cars = await Car.find(query)
    cars = cars.map((car) => {
        let t = {
            "lastEnteringDate": car.getLastEnteringDate(),
            "lastLeavingDate": car.getLastLeavingDate()
        }
        car = car.toObject()
        car.slot = (car.slot) ? car.slot : ''
        return {...car, ...t}
    })
    return res.json(cars)
})

router.post("/get/slot", auth, async function(req, res) {
    let car = await Car.findOne({
        slot: req.body.slot
    })
    if(!car) return res.send("No car found in this slot")
    let returnCar = car.toObject()
    returnCar.plate = car.get("plate")
    returnCar.membership = car.get("membership")
    returnCar.owner = car.get("owner")
    returnCar.lastEnteringDate = (car.lastEntering) ? car.getLastEnteringDate() : 'N/A'
    returnCar.lastLeavingDate = (car.lastLeaving) ? car.getLastLeavingDate() : 'N/A'
    returnCar.timeElapsed = (car.lastEntering) ? car.getTimeElapsed() : 'N/A'
    returnCar.parkingFee = (car.lastEntering) ? car.getParkingFee() : 'N/A'
    return res.send(returnCar)
})

router.put("/", auth, async function(req,res) {
    let copiedData = {...req.body.data}
    delete copiedData._id
    const {error} = validate(copiedData)

    if(error) return res.status(400).send(error.details[0])

    let car = await Car.findOne({
        _id: {$ne: req.body.data._id},
        plate: req.body.data.plate
    })

    if(car) return res.status(400).send({
        message: "This numberplate has already been taken.",
        key: "plate"
    })

    car = await Car.findById(req.body.data._id, function(err) {
    })
    if(!car) return res.send("No car found.")

    if(req.body.data.isParking == 'false') {
        if(req.body.data.isParking != car.isParking) {
            let data = {
                leftAt: req.body.data.lastLeaving,
                enteredAt: req.body.data.lastEntering,
                slot: car.slot,
                _carId: car._id,
                price: car.getParkingFee(),
                duration: car.getTimeElapsed()
            }
            carLeaving(data)
        }
        req.body.data.slot = ''
    }
    else {
        if(req.body.data.slot == '') return res.status(400).send({
            message: "Slot is required",
            key: "slot"
        })
        car = await Car.findOne({
            _id: {$ne: req.body.data._id},
            slot: req.body.data.slot.toUpperCase()
        })

        if(car) return res.status(400).send({
            message: "This slot has already been taken.",
            key: "slot"
        })
    }

    car = await Car.updateOne({
        _id: req.body.data._id
    },
    {
        plate: req.body.data.plate,
        model: req.body.data.model,
        owner: req.body.data.owner,
        membership: req.body.data.membership,
        lastEntering: req.body.data.lastEntering,
        lastLeaving: req.body.data.lastLeaving,
        isParking: req.body.data.isParking,
        slot: req.body.data.slot.toUpperCase()
    })

    return res.send("Successful")
})

router.post("/register", auth, async (req, res) => {
    const { error } = validate(req.body.data)

    if(error) return res.status(400).send(error.details[0])

    let car = await Car.findOne({
        plate: req.body.data.plate
    })

    if(car) return res.status(400).send({
        message: "This numberplate has already been taken.",
        context: {
            key: "plate"
        }
    })

    car = new Car({
        owner: req.body.data.owner,
        model: req.body.data.model,
        plate: req.body.data.plate,
        membership: req.body.data.membership,
        lastEntering: req.body.data.lastEntering,
        lastLeaving: req.body.data.lastLeaving,
        isParking: req.body.data.isParking,
        slot: req.body.data.slot
    })
    await car.save()

    res.send("Successful")
})

router.delete("/", auth, async (req,res) => {
    Car.findByIdAndDelete(req.body._id, (err) => {

    })

    res.send("Deleted")
})

const carLeaving = (data) => {
    let history = new History({
        leaveTime: data.leftAt,
        enterTime: data.enteredAt,
        slot: data.slot,
        _car: data._carId,
        price: data.price,
        duration: data.duration
    })
    history.save()
}

module.exports = router