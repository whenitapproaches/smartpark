const jwt = require('jsonwebtoken')
const config = require('config')

function auth(req, res, next) {
    const token = req.cookies["jwt-token"]

    if(!token) {
        req.flash("error", "You should log in first")
        return res.redirect("http://" + req.headers.host + "/login")
    }

    try {
        const decoded = jwt.verify(token, config.get("privateKey"))

        req.username = decoded
        next()
    }
    catch(err) {
        res.status(400).send("Invalid token")
    }

}

module.exports = auth