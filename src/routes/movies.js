const router = require('express').Router()
const Movie = require('../models/Movies')
const auth = require('../middleware/auth')

router.post('/movie',auth , async (req, res) => {
    if(req.user.isAdmin){
        const movie = new Movie(req.body)
        try {
             await movie.save()
             res.status(201).send(movie)
        } catch (error) {
            res.status(500).send(error)
        }

    }else {
        res.status(403).send('you are not allowed to add movies')
    }
})

router.get('/movie/:id', auth, async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)
        if(!movie){
            return res.status(404).send()
        }
        res.send(movie)
    } catch (error) {
        res.status(500).send(error)
    }
})
router.get('/movie/find/random', auth, async (req, res) => {
    const type = req.query.type
    let movie
    try {
        if(type === "series"){
            movie = await Movie.aggregate([
                {$match : {isSerie: true}},
                {$sample: {size: 1}},
            ])
        }else {
            movie = await Movie.aggregate([
                {$match : {isSerie: false}},
                {$sample: {size: 1}},
            ])

        }
        res.send(movie)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/movies',auth, async (req, res) => {
    try {
        const movies = await Movie.find({})
        res.send(movies)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/movie/:id',auth, async (req, res) => {
    if(req.user.isAdmin){
        const updates = Object.keys(req.body)
        const allowedUpdates = ['title', 'desc', 'image', 'imageTitle', 'imageTitle', 'imageSm', 'trailer', 'video', 'year', 'limit', 'genre', 'isSerie']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    
        if(!isValidOperation){
            return res.status(400).send({error: 'Invalid updates'})
        }
        try {
            // const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
             const movie = await Movie.findById(req.params.id)
            updates.forEach((update) => movie[update] = req.body[update])
            if(!movie){
                return res.status(404).send()
            }
            await movie.save()
            res.send(movie)
        } catch (error) {
            res.status(500).send(error)
        }
    }else {
        res.status(403).send("you are not allowed to edit movie")
    }
   
})

router.delete('/movie/:id', auth, async (req, res) => {
    if(req.user.isAdmin){
        try {
            const movie = await Movie.findByIdAndDelete(req.params.id)
            if(!movie){
                return res.status(404).send()
            }
            res.send(movie)
        } catch (error) {
            res.status(500).send(error)
        }
    } else {
        res.status(403).send("you are not allowed to delete movie")
    }
})

module.exports = router