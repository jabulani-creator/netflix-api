const router = require('express').Router()
const User = require('../models/User')
const auth = require('../middleware/auth')


router.post('/user/register', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/user/login', async (req, res) => {
    try {
        //made funtion
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user, token})
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})
router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get("/user/me", auth, async (req, res) => {
     res.send(req.user)
})
router.get("/users", auth, async (req, res) => {
    if(req.user.isAdmin){
        try {
            const users = await User.find({})
            res.send(users)
        } catch (error) {
            res.status(500).send(error)
        }
    }else{
        res.status(403).send('you are not allowed to see all users')
    }
  
})


router.patch('/user/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'email', 'password', 'profilePic']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invlaid updates!'})
    }
    try {
    //   const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        // const user = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
      res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/user/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users/stats', auth, async (req, res) => {
    if(req.user.isAdmin){
        const today = new Date();
        const lastYear = today.setFullYear(today.setFullYear() -1)
    
        const monthsArray = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];
    
        try {
            const data = await User.aggregate([
                {
                    $project: {
                        month: {$month: "$createdAt"}
                    }
                },
                {
                    $group: {
                        _id: "$month",
                        total: {$sum: 1}
                    }
                }
            ])
            res.status(200).send(data)
        } catch (error) {
            res.status(500).send(error)
        }

    }else {
        res.status(403).send('you are not allowed to see all users')
    }
})

module.exports = router