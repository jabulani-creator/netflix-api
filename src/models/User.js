const bcrypt = require("bcryptjs/dist/bcrypt")
const mongoose = require("mongoose")
const validator = require("validator")
const jwt = require("jsonwebtoken")

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password cant be password')
            }
        }
    },
    profilePic: {
        type: String,
        default: ""
    }, 
    isAdmin: {
        type: Boolean,
        default: false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

}, {timestamps: true})

UserSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

UserSchema.methods.generateAuthToken = async function(){
    const user = this

    const token = jwt.sign({_id: user._id.toString(), isAdmin: user.isAdmin}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if(!user){
        throw new Error('unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('unable to login')
    }

    return user
}

UserSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User