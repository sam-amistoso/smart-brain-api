const bcrypt = require('bcryptjs') // import bcryptjs package one way encryption
const connectDB = require('../db')
const Clarifai = require('clarifai');
const validator = require('validator')
const User = require('../modules/User')


exports.home = function(req, res) {
    return new Promise((resolve, reject) => {
        resolve(res.json(db.users))
    })
}

exports.signIn = function(req, res) {
    try {            
    let user = new User(req.body)
    user.login().then(function(result) {
        //console.log(result)
        res.json(result)
    })
    .catch(err => res.json("Unable to Sign In"))
       
    } catch (error) {
        console.log(error)
        res.status(500).json("Server Error")
    }
    
}

exports.register = async function(req, res) {
    let user = new User(req.body)
    //console.log(req.body)
    try {
        user.signUp().then(response => {
            //console.log(response, "Response from register")
            res.json(response)
        }).catch(err => res.json("Unable to Register"))        
    } catch (error) {
        res.json(error)
        console.log(error)
    }
                
}

exports.profile = function(req, res) {
    const {id} = req.params
    connectDB.select('*').from('users').where({id})
    .then(user => {
        //console.log(user)
        if (user.length) {
            res.json(user[0])            
        } else {
            res.status(404).json('Id not found') 
        }
    })
    .catch(err => res.json(err))        
}

exports.uploadImage = function(req, res) {
    try {
        const {id} = req.body        
        connectDB('users')
            .where('id', '=', id)
            .increment('entries', 1)
            .returning('entries')
            .then(entries => {                
                res.json(entries[0])
            })
            .catch(err => {                
                res.json('unable to update entries')
            })
    } catch (error) {
        res.status(500).json('unable to update entries')
    }    
}

exports.imageUrl = function(req, res) {
    try {
        const { imageURL } = req.body
        // initialize with your api key. This will also work in your browser via http://browserify.org/
        const app = new Clarifai.App({
           apiKey: process.env.CLARIFAIAPIKEY
           });
           //console.log(imageURL)
           app.models.predict(Clarifai.FACE_DETECT_MODEL, imageURL)
           .then(response => {
               //console.log(response)
               return res.json(response)
           })
           .catch(error => {
               res.status(500).json('Unable to get clarifai data')
           })
    } catch (error) {
        console.log(error)
    }
}