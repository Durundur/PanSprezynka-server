const express = require('express')
const mongoose = require('mongoose')
const StatsModel = require('./Schemas/StreamStats')
const connectDb = require('./db')
const cors = require('cors');
const app = express()
const PORT = process.env.PORT || 7000

app.use(cors({ origin: true }));


connectDb()
app.listen(PORT,()=>{
    console.log('server listeninng on port', PORT);
})
app.use('/streams', async function(req,res){
    try{
        const data = StatsModel.find()
        res.send(data)
    }
    catch(error){
        console.log(error)
    }
})


