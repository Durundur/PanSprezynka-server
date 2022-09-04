const mongoose = require('mongoose')
const config = require('config')
const dbURI = config.get('dbURI')

async function connectDb(){
    try{
        await mongoose.connect(dbURI)
        console.log('DB connected')
    }
    catch(error){
        console.log(error)
    }
}


module.exports = connectDb