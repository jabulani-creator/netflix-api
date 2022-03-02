const express = require("express")
const dotenv = require('dotenv')
dotenv.config({ path: './config/dev.env' });

require('./db/mongoose')
const userRouter = require('./routes/users')
const movieRouter = require('./routes/movies')
const listRouter = require('./routes/lists')


const app = express()
const port = process.env.PORT 
app.use(express.json())

app.use('/api', userRouter)
app.use('/api', movieRouter)
app.use('/api', listRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})