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


async function getVievers(userLogin){
    let query = 'user_login='+userLogin
    try{
        const res = await fetch('https://api.twitch.tv/helix/streams?'+query, {method: 'GET', headers:{'Authorization':  'Bearer ' + OAuth.access_token, 'Client-Id': clientId}})
        const json = await res.json()
        if(json.data.length==0){
            return 'stream is offline'
        } 
        else{
            return {'currentViewers': json.data[0].viewer_count, 'id': json.data[0].id, 'channelName': json.data[0].user_login}
        }
        
    }
    catch(error){
        console.log(error)
    }
}

async function getChatters(userLogin){
    try{
        const res = await fetch('https://tmi.twitch.tv/group/user/'+userLogin+'/chatters', {method: 'GET'})
        const json = await res.json()
        let date = new Date().toLocaleString('en-GB', {timeZone: 'Europe/Warsaw'})
        return {'currentChatters': json.chatter_count, 'time':date}
    }
    catch(error){
        console.log(error)
    }
}

async function getStreamStats(channelName){
    const vievers = await getVievers(channelName)
    const chatters = await getChatters(channelName)
    let stats = {...vievers, ...chatters}
    return stats
}


module.exports = {getOAuth, getChatters, getVievers, getStreamStats}



