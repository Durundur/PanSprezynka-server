const fetch = require('node-fetch');
const config = require('config');

const clientId = config.get('clientId')
const clientSecret = config.get('clientSecret')

let OAuth = {
    access_token: 'njnjxl6iglisedjwsv104ho3epaf9p',
    expires_in: 5075490,
    token_type: 'bearer'
}

async function getOAuth(){
    try{
        const res = await fetch('https://id.twitch.tv/oauth2/token', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({
            'client_id': clientId,
            'client_secret': clientSecret,
            'grant_type': 'client_credentials'
        })})

        if (res.status >= 400) {
            throw new Error("Bad response from server");
        }
        const json = await res.json()
        OAuth = json
    }
    catch(error){
        console.log(error)
    }
}

function getVievers(userLogin){
    let query = 'user_login='+userLogin
    fetch('https://api.twitch.tv/helix/streams?'+query, {method: 'GET', headers:{'Authorization':  'Bearer ' + OAuth.access_token, 'Client-Id': clientId}})
    .then(response=>{
        response.json()
    })
    .then(data=>{
        return {'currentViewers': data.data[0].viewer_count}
    })
    .catch(error=>{
        console.error(error)
    })
}

function getChatters(userLogin){
    fetch('https://tmi.twitch.tv/group/user/'+userLogin+'/chatters', {method: 'GET'})
    .then(response=>{
        return response.json()
    })
    .then(data=>{
        return {'currentChatters': data.chatter_count, 'time': new Date()}

    })
    .catch(error=>{
        console.error(error)
    })
}

function getStreamStats(channelName){
    const viewers = getVievers(channelName)
    const chatters = getChatters(channelName)
    return viewers
}

const t = getStreamStats('kalach444')
console.log(t)
// module.exports = getStreamStat()




