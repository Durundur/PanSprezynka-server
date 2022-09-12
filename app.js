const express = require('express')
const mongoose = require('mongoose')
const StatsModel = require('./Schemas/StreamStatsModel')
const connectDb = require('./db')
const cors = require('cors');
const app = express()

const PORT = process.env.PORT || 7000

const cron = require('node-cron');

const streamsData = require('./streamsData')

const fs = require('fs')
app.use(cors({ origin: true }));


let streamerList = []

async function monitoreStreams(){
    cron.schedule('*/2 * * * *',async function(){
        console.log('checking the streams...')
        for(let streamer of streamerList){
            let vieversData = await streamsData.getVievers(streamer)
            if(vieversData!=='stream is offline'){
                let chattersData = await streamsData.getChatters(streamer)
                let streamFromDB = await StatsModel.findById(vieversData.id)
                if(streamFromDB==null){
                    StatsModel.create({'_id': vieversData.id, 'channelName': vieversData.channelName,'stats': [{'currentViewers': vieversData.currentViewers, ...chattersData}]})
                }
                else{
                    streamFromDB.stats.push({'currentViewers': vieversData.currentViewers, ...chattersData})
                    await streamFromDB.save()
                }
            }
        }
        console.log('streams have been checked...')
    })
}

function updateStreamerList(){
    fs.readFile('./streamersList.txt','utf-8', (err,data)=>{
        if (err) console.log(err)
        streamerList = data.split('\n')
    });
    console.log('streamer list has been updated');
}


connectDb(()=>{
    app.listen(PORT,()=>{
        console.log('server listeninng on port', PORT);
    })
})
updateStreamerList()
streamsData.getOAuth()
monitoreStreams()

app.use('/streams/user/:streamerName', async function(req,res){
    try{
        const data = await StatsModel.find({channelName: req.params.streamerName}).sort({createdAt: -1})
        if(data.length==0){
            res.statusCode=404
            res.send({msg: 'no data found for this streamer name'})
        } 
        else{
            res.send(data)
        }
    }
    catch(error){
        console.log(error)
    }
})

app.use('/streams', async function(req,res){
    try{
        const data = await StatsModel.find().sort({createdAt: -1}).limit(5)
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


