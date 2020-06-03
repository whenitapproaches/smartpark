const app = require('express')
const router = app.Router()
const auth = require('../middlewares/auth')
const config = require('config')
const { Setting, validate } = require('../models/setting')

router.get("/", auth, async (req, res) => {
    let setting = new Setting({
        price: {
            premium: 300,
            basic: 200
        },
        currency: "VND",
        sessionTimeout: 3600000
    })
    setting.save()
    return res.render("settings", {
        activePage: "settings"
    })
})

router.put("/", auth, async (req,res) => {

})











module.exports = router