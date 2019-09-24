const express = require('express') // import express package
const router = express.Router() // use Router Module
const userController = require('./controllers/userController')

router.get('/', userController.home)
router.post('/signin', userController.signIn)
router.post('/register', userController.register)
router.get('/profile/:id', userController.profile)
router.put('/image', userController.uploadImage)
router.post('/imageURL', userController.imageUrl)

module.exports = router