const express = require('express')
const mongoose = require('mongoose')
const StatsModel = require('./Schemas/StreamStatsModel')
const connectDb = require('./db')
const cors = require('cors');
const app = express()
const PORT = process.env.PORT || 7000
const cron = require('node-cron');
const streamsData = require('./streamsData')

app.use(cors({ origin: true }));


const streamerList = ['bonkol', 'kalach444', 'inet_saju','spiralusgtm', 'kasix','ewroon']

async function monitoreStreams(){
    cron.schedule('*/2 * * * *',async function(){
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
        console.log('running...')
    })
}



connectDb()
app.listen(PORT,()=>{
    console.log('server listeninng on port', PORT);
})

monitoreStreams()



app.use('/streams', async function(req,res){
    try{
        const data = await StatsModel.find()
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

