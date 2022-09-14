const mongoose = require('mongoose')


const StreamStats = new mongoose.Schema({
    channelName: String,
    _id: String,
    channelImg: String,
    stats: [{
        currentViewers: Number,
        currentChatters: Number,
        time: String,
        _id: false
    }],
},{ timestamps: true })

module.exports = streamsStatsModel = mongoose.model('streamsStatsModel', StreamStats)