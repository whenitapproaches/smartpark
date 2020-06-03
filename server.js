//import './resources/scss/app.scss'

const fs = require('fs')

const config = require('config')

const express = require('express')

const flash = require('connect-flash');
const FormData = require('form-data')

const app = express()

const fetch = require('node-fetch')

var session = require('express-session')

const bodyParser = require('body-parser')
const page404 = require('./middlewares/404')
const Axios = require('axios')
const cookieParser = require('cookie-parser')
const routeUser = require("./routes/route.user")
const routeCar = require("./routes/route.car")
const routerSetting = require('./routes/route.settings')
const routerHistory = require('./routes/route.history')
const auth = require('./middlewares/auth')
const isGuest = require('./middlewares/isGuest')
const mongoose = require('mongoose')
const {Car} = require('./models/car')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(flash());
app.use(session({
    cookie: {
        maxAge: 60000
    },
    secret: 'woot',
    resave: false,
    saveUninitialized: false,
}))
app.use(cookieParser())

const Tesseract = require('tesseract.js')

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })


Tesseract.recognize(
  'https://tesseract.projectnaptha.com/img/eng_bw.png',
  'eng'
).then(({ data: { text } }) => {

})

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/', auth, async (req,res) => {
    let cars = await Car.find({
        slot: /./g
    })
    let occupiedSlots = []
    cars.forEach((car) => {
        occupiedSlots.push(car.slot)
    })
    res.render('home', {
        activePage: 'home',
        slots: occupiedSlots
    })
})

app.get('/login', isGuest, (req,res) => {
    res.render('login', {
        messages: req.flash("error")
    })
})

app.post('/check', upload.single('image'), (req,res) => {
    const filename = req.file.filename
    console.log(filename)
    Tesseract.recognize('uploads/' + filename, 'eng')
    .then(({data: {text}}) => {
        res.end(text)
    })
})

app.post('/check1', upload.single('image'), (req,res) => {
    const filename = req.file.filename
    let body = new FormData()
    let filePath = './uploads/' + filename
    body.append("upload", fs.createReadStream(filePath))
    body.append("regions", "vn")
    fetch("https://api.platerecognizer.com/v1/plate-reader/", {
        method: 'POST',
        headers: {
            "Authorization": "Token e7a842fd1b0d5546216edca0f370c7ae0556dd68"
        },
        body: body
    }).then(res => res.json())
    .then(json => {
        let end = JSON.stringify(json.results)
        res.end(end)
    })
    .catch((err) => {
        console.log(err)
    });
})

mongoose.connect("mongodb://localhost:27017/smartpark", {useNewUrlParser: true, useUnifiedTopology: true})
.then( (res) => console.log("Database connected.") )
.catch( (err) => console.error("There was an error connecting to database") )

app.use("/user", routeUser)
app.use("/cars", routeCar)
app.use("/settings", routerSetting)
app.use("/history", routerHistory)
app.use(page404)

app.listen(config.get("port"))