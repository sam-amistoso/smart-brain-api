const knex = require('knex')
const dotenv = require('dotenv')
dotenv.config()

let port = process.env.PORT
let dbconnection = {}
if (port != 3000 || port == null || port == "") {
    dbconnection = process.env.PG_CONNECTION_STRING
} else {
    dbconnection = JSON.parse(process.env.PG_CONNECTION_STRING)
}

//console.log(dbconnection)

const db = knex({
    client: 'pg',
    connection: dbconnection
})

//  db.select('*').from('users').then(data => {
//      console.log(data)
//  })
//  .catch(console.log)

module.exports = db;
// var pg = require('knex')({
//     client: 'pg',
//     connection: process.env.PG_CONNECTION_STRING,
//     searchPath: ['knex', 'public'],
//   });