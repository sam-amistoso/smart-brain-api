const bcrypt = require('bcryptjs') // import bcryptjs package one way encryption
const validator = require('validator') //validator npm package
const connectDB = require('../db')

let User = function(data) {
    this.data = data // store pass data
    this.errors = [] // initialize empty array        
}

User.prototype.cleanUp =  function() {
    
    if (typeof(this.data.name) != "string") {this.data.name = ""}
    if (typeof(this.data.email) != "string") {this.data.email = ""}
    if (typeof(this.data.password) != "string") {this.data.password = ""}

    // Get rid of any bogus properties
    this.data = {
        name: this.data.name.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.validate = function() {
    //console.log(this.data, "Validate Function")
    return new Promise(async (resolve, reject) => {
        
        if (this.data.name == '') {this.errors.push("You must provide a name.")}
        if (this.data.name != "" && !validator.isAlphanumeric(this.data.name)) {this.errors.push("Name can only contain letters and numbers.")}
        if (!validator.isEmail(this.data.email)) {this.errors.push("You must provide a valid email address.")}
        if (this.data.password == '') {this.errors.push("You must provide a password.")}
        if (this.data.password.length > 0 && this.data.password.length < 8) {this.errors.push("Password must be at least 8 characters")}
        if (this.data.password.length > 50) {this.errors.push("Password cannot exceed 50 characters")}
        if (this.data.name.length > 0 && this.data.name.length < 3) {this.errors.push("Name must be at least 3 characters")}
        if (this.data.name.length > 30) {this.errors.push("Name cannot exceed 30 characters")}
    
        // Only if  name is valid then check to see if it's already taken
        if (this.data.name.length > 2 && this.data.name.length < 31 && validator.isAlphanumeric(this.data.name)) {
            
                await connectDB.select('name').from('users')
                    .where('name', '=', this.data.name)
                    .then(response => {
                        if (response.length) {
                            this.errors.push("That name is already taken.")
                            resolve()                                                      
                        }                                                
                    })
                    .catch(console.log)            
        }
    
        // Only if  email is valid then check to see if it's already taken
         if (validator.isEmail(this.data.email)) {

                await connectDB.select('email').from('users')
                 .where('email', '=', this.data.email)
                 .then(response => {
                     if (response.length) {
                         this.errors.push("That email is already being used.")
                         resolve()                                                                   
                     }                      
                 })
                 .catch(console.log)             
         }
        
        resolve()
    })
    
}

User.prototype.login = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()        
        connectDB.select('email', 'hash').from('login')
            .where('email', '=' , this.data.email)
            .then(data => {
                if (bcrypt.compareSync(this.data.password, data[0].hash)) {
                    connectDB.select('*').from('users')
                             .where('email', '=', this.data.email)
                             .then(user => {
                                resolve(user[0]) 
                             })
                             .catch(err => reject("unable to get user"))
                } else {
                    reject('wrong credentials')
                }
            })
            .catch(err => reject(err))
    })
}

User.prototype.signUp = function() {
    return new Promise(async (resolve, reject) => {
        // Step #1: Validate user input
        this.cleanUp
        await this.validate()
        
        // Step #2: Only if no validation errors then save the user data into the DB        
        if(!this.errors.length) {
            let salt = bcrypt.genSaltSync(10)
            const userPassword = bcrypt.hashSync(this.data.password, salt)
            await connectDB.transaction(trx => {
                    trx.insert({
                        hash: userPassword, 
                        email: this.data.email
                    })
                    .into('login')
                    .returning('email')
                    .then(logInEmail => {
                        return trx('users')
                                .returning('*')
                                .insert({
                                    email: logInEmail[0],
                                    name: this.data.name,
                                    joined: new Date()
        
                                })
                                .then(user => {
                                    //res.json(user[0])
                                    this.data = (user[0])
                                })
                                // .catch(err => {
                                //     res.json(err)
                                //     console.log(err)
                                // })
                    })
                    .then(trx.commit)
                    .catch(trx.rollback)
                })

            resolve(this.data)
        } else {
            resolve(this.errors)
        }

    })
}

module.exports = User;