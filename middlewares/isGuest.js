const jwt = require('jsonwebtoken')
const config = require('config')

function isGuest(req, res, next) {
    const token = req.cookies["jwt-token"]

    if(token) return res.redirect(config.get("URL.home"))

    next()
}

module.exports = isGuest