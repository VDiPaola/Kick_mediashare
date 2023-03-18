const WebSocket = require('ws');
const express = require('express')
const cors = require('cors')
const app = express()

const wsPort = 8080
const backendPort = 4000

// WEBSOCKET
const wss = new WebSocket.Server({ port: wsPort });

let kickSocket = null
let websiteSocket = null

const prefix = "!"
const wsCluster = "us2"
const wsKey = "eb1d5f283081a78b932c"
// Echo.connector.options
const url = `wss://ws-${wsCluster}.pusher.com/app/${wsKey}?protocol=7&client=js&version=7.4.0&flash=false`

const chatroomId = 65515
//fetch("https://kick.com/api/v1/channels/DezYudi").then(res => res.json()).then(res => console.log(res.chatroom.id))

function sendMessage(event, data, user){
  let res = {...data, event, user}
  websiteSocket.send(JSON.stringify(res))
}

function parseMessage(data){
    if (!websiteSocket) return
    let message = data.message.message.trim()
    let user = data.user
    if (message[0] === prefix){
        //remove any duplicate spacing
        message = message.replaceAll(/\s\s+/g, ' ');
        message = message.replaceAll(String.fromCharCode(160),' ')
        //split to get command
        let words = message.split(' ')
        let command = words[0].slice(1).toLowerCase()
        switch(command){
            case "share":
                let video = words[1]
                let startTime = words.length > 2 ? words[2] : 0
                startTime = isNaN(startTime) ? 0 : startTime
                sendMessage("video_add" ,{video, startTime}, user)
                break;
            case "tts":
                let message = message.slice(4);
                //trigger stream labs alert
            default:
                console.log("no command found for: ", command)
        }
    }
    
}



// Media Share websocket
wss.on('connection', (ws) => {
  console.log('Client connected');
  // Handle incoming messages
  ws.on('message', (response) => {
    response = JSON.parse(response)
    if (response.message === "website_initialise"){
      console.log("connected to media share websocket")
        websiteSocket = ws
    }
  });

  // Handle disconnections
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

//Kick websocket
kickSocket = new WebSocket(url);
kickSocket.on('error', console.error);
kickSocket.on('open', (event) => {
  console.log('WebSocket connection established.');
});
kickSocket.on('message', (kickResponse) => {
  kickResponse = JSON.parse(kickResponse)
  if (kickResponse.event === "pusher:connection_established"){
    //subscribe to chat messages
    console.log("Listening to chat messages at: " + chatroomId)
      kickSocket.send(JSON.stringify({"event":"pusher:subscribe","data":{"auth":"","channel":"chatrooms."+chatroomId}}))
    
  }else if (kickResponse.event.includes("ChatMessageSentEvent")){
    //recieved chat message
      let data = JSON.parse(kickResponse.data)
      parseMessage(data)
  }
});

kickSocket.on('close', (event) => {
  console.log('WebSocket connection closed.');
});



//BACKEND
app.use(cors())
app.use(express.json())
app.post('/video', (req, res) => {
    let data = req.body
    console.log(data)
	if (websiteSocket){
        if (data.message === "video_play"){
            websiteSocket.send(JSON.stringify({"event":"video_play"}))
        }
        else if (data.message === "video_pause"){
            websiteSocket.send(JSON.stringify({"event":"video_pause"}))
        }else if (data.message === "video_skip"){
            websiteSocket.send(JSON.stringify({"event":"video_skip"}))
        }else if (data.message === "video_volume"){
            websiteSocket.send(JSON.stringify({"event":"video_volume", volume:data.volume}))
        }else if (data.message === "video_speed"){
            websiteSocket.send(JSON.stringify({"event":"video_speed", speed:data.speed}))
        }else if (data.message === "video_forward"){
            websiteSocket.send(JSON.stringify({"event":"video_forward"}))
        }else if (data.message === "video_back"){
            websiteSocket.send(JSON.stringify({"event":"video_back"}))
        }
        
    }
    res.send()
});
console.log("listening")
app.listen(backendPort);