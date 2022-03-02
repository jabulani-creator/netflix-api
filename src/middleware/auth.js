const jwt = require("jsonwebtoken")
const User = require('../models/User')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findOne({_id: decoded._id, isAdmin: decoded.isAdmin, 'tokens.token': token})

        if(!user){
            throw new Error()
        }
        // for logging out
        req.token = token
        req.user = user
        next()
    } catch (error) {
        res.status(401).send({error: "please authentic"})
    }
}

module.exports = auth