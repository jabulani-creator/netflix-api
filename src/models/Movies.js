const mongoose = require("mongoose")

const MovieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    desc:{type: String},
    image:{type: String},
    imageTitle:{type: String},
    imageSm:{type: String},
    trailer:{type: String},
    video:{type: String},
    year:{type: String},
    limit:{type: Number},
    genre:{type: String},
    isSerie: {
        type: Boolean,
        default: false
    }
},{timestamps: true})

const Movie = mongoose.model('Movie', MovieSchema)

module.exports = Movie