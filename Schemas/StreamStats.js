const mongoose = require('mongoose')


const StreamStats = new mongoose.Schema({
    channelName: String,
    startDate: Date,
    endDate: Date,
    Stats: [{
        currentViewers: Number,
        currentChatters: Number,
        currentDate: Date
    }]
})

module.exports = streamsStats = mongoose.model('StreamsStats', StreamStats)