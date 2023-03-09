const WebSocket = require('ws');
const express = require('express')
const cors = require('cors')
const app = express()


// WEBSOCKET
const wss = new WebSocket.Server({ port: 8080 });

let kickSocket = null
const websocketConfig = {
  wsKey: null,
  wsCluster: null
}

let websiteSocket = null

const prefix = "!"

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
                websiteSocket.send(JSON.stringify({"event":"video_add",video, startTime}))
                break;
            default:
                console.log("no command found for: ", command)
        }
    }
    
}



// Handle incoming connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  // Handle incoming messages
  ws.on('message', (response) => {
    response = JSON.parse(response)
    console.log(`Websocket Received message`);
    if (response.message === "initialise_connection" && !kickSocket){
      const chatroomId = response.data.chatroomId
      websocketConfig.wsCluster = response.data.wsCluster
      websocketConfig.wsKey = response.data.wsKey
      kickSocket = new WebSocket(`wss://ws-${response.data.wsCluster}.pusher.com/app/${response.data.wsKey}?protocol=7&client=js&version=7.4.0&flash=false`);
      kickSocket.on('error', console.error);
      kickSocket.on('open', (event) => {
        console.log('WebSocket connection established.');
      });
      kickSocket.on('message', (kickResponse) => {
        console.log("KickSocket recieved message: ")
        kickResponse = JSON.parse(kickResponse)

        if (kickResponse.event === "pusher:connection_established"){
            kickSocket.send(JSON.stringify({"event":"pusher:subscribe","data":{"auth":"","channel":"chatrooms."+chatroomId}}))
          
        }else if (kickResponse.event.includes("ChatMessageSentEvent")){
            let data = JSON.parse(kickResponse.data)
            parseMessage(data)
        }
      });
  
      kickSocket.on('close', (event) => {
        console.log('WebSocket connection closed.');
      });
    }else if (response.message === "website_initialise"){
        websiteSocket = ws
    }
    
    
  });

  // Handle disconnections
  ws.on('close', () => {
    console.log('Client disconnected');
  });
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
        }
        else if (data.message === "video_skip"){
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
app.listen(4000);