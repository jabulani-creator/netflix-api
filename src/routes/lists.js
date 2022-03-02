const auth = require('../middleware/auth')
const List = require('../models/List')
const router = require('express').Router()


router.post('/list', auth, async (req, res) => {
    if(req.user.isAdmin)
    {
        const list = new List(req.body)
        try {
            await list.save()
            res.send(list)
        } catch (error) {
            res.status(500).send(error)
        }

    }else {
        res.status(403).send('you are not allowed to make list')
    }
})

router.delete('/list/:id', auth, async (req, res) => {
    if(req.user.isAdmin)
    {
        try {
            const list = await List.findByIdAndDelete(req.params.id)
            if(!list){
                return res.status(400).send()
            }
            res.send('list deleted')
        } catch (error) {
            res.status(500).send(error)
        }
    }else {
        res.status(403).send('you are not allowed to delete list')
    }
})

router.get("/lists", auth, async (req, res) => {
    const typeQuery = req.query.type
    const genreQuery = req.query.genre
      let list = []
    try {
        if(typeQuery){
            if(genreQuery){
                list = await List.aggregate([
                    {$sample : {size: 7}},
                    {$match: {type: typeQuery, genre: genreQuery}}
                ])
            }else {
                list = await List.aggregate([
                    {$sample : {size: 7}},
                    {$match: {type: typeQuery}}
                ])
            }
        }else{
            list = await List.aggregate([
                {$sample : {size: 7}},
            ])

        }
        res.send(list)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router