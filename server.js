const express = require('express')
const app = express()
const router = require('./router')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()


app.use(express.urlencoded({extended: false})) //to add user submitted data from request
app.use(express.json()) //access json data

app.use(cors())
app.use('/', router)

app.listen(process.env.PORT)