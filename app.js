const express = require('express')
const mongoose = require('mongoose')
const StatsModel = require('./Schemas/StreamStats')
const connectDb = require('./db')
const cors = require('cors');
const app = express()
const PORT = process.env.PORT || 7000
const cron = require('node-cron');
const getStreamStat = require('./streamsData')

app.use(cors({ origin: true }));


connectDb()
app.listen(PORT,()=>{
    console.log('server listeninng on port', PORT);
})

const streamerList = ['bonkol']

cron.schedule('*/120 * * * * *',()=>{
    // for(let streamer of streamerList){
    //     getStreamStat(streamer)
    // }
    console.log('running...')
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
app.use('/status', (req,res)=>{
    console.log('status checked')
    res.send('running')
})

