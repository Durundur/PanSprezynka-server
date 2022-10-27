const express = require('express')
const mongoose = require('mongoose')
const playwright = require('playwright');
const StatsModel = require('./Schemas/StreamStatsModel')
const connectDb = require('./db')
const cors = require('cors');
const app = express()

const PORT = process.env.PORT || 7000

const cron = require('node-cron');

const streamsData = require('./streamsData')

const fs = require('fs');
const { time } = require('console');
app.use(cors({ origin: true }));


let streamerList = []


async function monitoreStreams(streamerList) {
    cron.schedule('*/4 * * * *', async function () {
        try {
            console.log('checking streams...')
            for (let startingIndex = 0; startingIndex < streamerList.length; startingIndex += 100) {
                let endingIndex = startingIndex + 99
                if (startingIndex + 99 > streamerList.length) {
                    endingIndex = streamerList.length - 1
                }
                const onlineStreams = await streamsData.getVievers(streamerList.slice(startingIndex, endingIndex))
                for (onlineStream of onlineStreams) {
                    const streamFromDB = await StatsModel.findById(onlineStream.id)
                    const chattersData = await streamsData.getChatters(onlineStream.user_login)
                    if (streamFromDB == null) {
                        const userImg = await streamsData.getUserImg(onlineStream.user_name)
                        StatsModel.create({ 'userId': onlineStream.user_id, '_id': onlineStream.id, 'channelImg': userImg, 'channelName': onlineStream.user_login, 'stats': [{ 'gameName': onlineStream.game_name, 'currentViewers': onlineStream.viewer_count, ...chattersData }] })
                    }
                    else {
                        streamFromDB.stats.push({ 'currentViewers': onlineStream.viewer_count, ...chattersData })
                        await streamFromDB.save()
                    }
                }
            }
            console.log('streams have been checked')
        }
        catch (error) {
            console.log(error)
        }
    })
}
const scrapEvents = async (data, browser)=>{
    const page = await browser.newPage();
    await page.goto(`https://streamscharts.com/channels/${data.channelName}/streams/${data._id}`);
    let events = await page.$$eval('tbody tr.text-xs', elements => elements.map(
        element => ({
            time: new Date(element.querySelector('span').getAttribute('data-tippy-content')).toISOString(),
            event: element.querySelector('div.truncate').textContent,
            eventInfo: element.querySelector('div.truncate').nextElementSibling ? element.querySelector('span[x-ref="text"]').textContent : ''
        })
    ));
    if(events.length>0){
        console.log('success')
        data['events'] = events
        await data.save()
        await browser.close();
        return Promise.resolve()
    }
    else{
        console.log('failure, setting timeout')
        // setTimeout(()=>{
        //     console.log('timeout has ended, retiring')
        // }, 60000)
        await scrapEvents(data, browser)
    }
}




function updateStreamerList() {
    streamerList = fs.readFileSync('top400twitch.txt').toString().replace(/\r\n/g, '\n').toLowerCase().split('\n');
    console.log('streamer list has been updated');
}
function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s*1000));
  }

const main = (async () => {
    await streamsData.getOAuth()
    await monitoreStreams(streamerList)
})



const updateEvents = (async () => {
    for (let channelName of streamerList) {
        let dataa = await StatsModel.find({ channelName: channelName })
        for (const data of dataa) {
            if (data.events.length == 0){
                console.log('start scraping', data.channelName, data._id)
                const browser = await playwright.chromium.launch();
                const page = await browser.newPage();
                await page.goto(`https://streamscharts.com/channels/${data.channelName}/streams/${data._id}`);
                let events
                if(await page.title() == 'Page not Found (404)'){
                    continue;
                }
                try{
                    const elementHandle = await page.waitForSelector('tbody', {timeout: 40000})
                    events = await elementHandle.$$eval('tr.text-xs', elements => elements.map(
                        element => ({
                            time: new Date(element.querySelector('span').getAttribute('data-tippy-content')).toISOString(),
                            event: element.querySelector('div.truncate').textContent,
                            eventInfo: element.querySelector('div.truncate').nextElementSibling ? element.querySelector('span[x-ref="text"]').textContent : ''
                        })
                    ))
                }catch(e){
                    if (e instanceof playwright.errors.TimeoutError){
                        await page.screenshot({ path: 'screenshot44.png' });
                    }
                }
                if(events.length>0){
                    console.log('success')
                    data['events'] = events
                    await data.save()
                    await browser.close();
                }
                else{
                    console.log('failure, setting timeout')
                    await sleep(60)
                    console.log('trying again')
                    await page.screenshot({ path: 'screenshot2.png' });
                    await scrapEvents(data, browser)
                }
            }
        }
    }
})

connectDb(() => {
    app.listen(PORT, () => {
        console.log('server listeninng on port', PORT);
    })
})


updateStreamerList()
// main()
updateEvents()




app.use('/streams/user/:streamerName', async function (req, res) {
    try {
        const data = await StatsModel.find({ channelName: req.params.streamerName }).sort({ createdAt: -1 })
        if (data.length == 0) {
            res.statusCode = 404
            res.send({ msg: 'no data found for this streamer name' })
        }
        else {
            res.send(data)
        }
    }
    catch (error) {
        console.log(error)
    }
})

app.use('/streams', async function (req, res) {
    try {
        const data = await StatsModel.find().sort({ updatedAt: -1 }).limit(5)
        res.send(data)
    }
    catch (error) {
        console.log(error)
    }
})
app.use('/status', (req, res) => {
    console.log('status checked')
    res.send('running')
})


