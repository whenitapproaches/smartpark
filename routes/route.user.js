const {User, validate} = require('../models/user')
const auth = require('../middlewares/auth')
const app = require('express')
const config = require('config')
const router = app.Router()
const bcrypt = require('bcrypt')
const flash = require('connect-flash');

router.get("/", auth, async (req,res) => {
    return res.redirect('/')
})

router.post("/authentication", async (req,res) => {
    const { error } = validate(req.body)

    if(error) {
        req.flash("error", error.details[0].message)
        return res.redirect("http://" + req.headers.host + "/login")
    }

    const user = await User.findOne({
        username: req.body.username
    })

    if(!user) {
        req.flash("error", "Username not found")
        return res.redirect("http://" + req.headers.host + "/login")
    }

    bcrypt.compare(req.body.password, user.password)
    .then( (isMatch) => {
        if(!isMatch) {
            req.flash("error", "Your password is wrong")
            return res.redirect("http://" + req.headers.host + "/login")
        }
        const token = user.generateAuthToken()
        res.cookie('jwt-token', token, {
            maxAge: config.get("user.session_time"),
        })
        return res.redirect("http://" + req.headers.host)
    } )
    .catch( (err) => console.log(err) )
})

router.post("/register", async (req, res) => {
    const { error } = validate(req.body)

    if(error) return res.status(400).send(error.details[0].message)

    let user = await User.findOne({
        username: req.body.username
    })

    if(user) return res.status(400).send("This username has already been taken.")
    
    let encryptedPassword = await bcrypt.hash(req.body.password, 10)

    user = new User({
        username: req.body.username,
        password: encryptedPassword,
    })

    await user.save()

    const token = user.generateAuthToken()
    res.cookie('jwt-token', token, {
        maxAge: config.get("user.session_time"),
    })
    res.send({
        username: user.username
    })
})

router.get("/signout", auth, async (req,res) => {
    res.clearCookie("jwt-token")
    return res.redirect("/login")
})

module.exports = router