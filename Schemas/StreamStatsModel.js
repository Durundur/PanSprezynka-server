const mongoose = require('mongoose')


const StreamStats = new mongoose.Schema({
    channelName: String,
    userId: String,
    _id: String,
    channelImg: String,
    stats: [{
        currentViewers: Number,
        currentChatters: Number,
        time: String,
        gameName: String,
        _id: false
    }],
    events: [{
        time: String,
        event: String,
        eventInfo: String,
        _id: false
    }]
},{ timestamps: true })

module.exports = streamsStatsModel = mongoose.model('streamsStatsModel', StreamStats)