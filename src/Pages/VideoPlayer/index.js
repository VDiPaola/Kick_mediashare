import { useEffect, useState } from 'react';
import YoutubeComponent from './YoutubePlayer'

const VideoPlayerPage = (props) => {
    const [videos, setVideos] = useState([])
    const [showVideo,setShowVideo] = useState(false)
    const [videoObject, setVideoObject] = useState(null)
    const [videoId, setVideoId] = useState("")
    const [socket,setSocket] = useState(new WebSocket("ws://localhost:8080"))

    

    useEffect(()=>{
        function socketOpen(){
            socket.send(JSON.stringify({message:"website_initialise"}));
        }
        function socketMessage(event){
            let data = JSON.parse(event.data)
            console.log(data)
            console.log(videoObject)
            if (data.event === "video_play" && videoObject){
                videoObject.playVideo()
            }else if (data.event === "video_pause" && videoObject){
                videoObject.pauseVideo()
            }else if (data.event === "video_back" && videoObject){
                videoObject.seekTo(videoObject.getCurrentTime() - 10, true)
            }else if (data.event === "video_forward" && videoObject){
                videoObject.seekTo(videoObject.getCurrentTime() + 10, true)
            }else if (data.event === "video_skip"){
                onEnd()
            }else if (data.event === "video_volume" && videoObject){
                videoObject.setVolume(data.volume)
                
            }else if (data.event === "video_speed" && videoObject){
                videoObject.setPlaybackRate(Number(data.speed))
            }else if (data.event === "video_add"){
                //convert to video id
                let id = youtube_parser(data.video)
                if (data.startTime){
                    id += "?t=" + data.startTime
                }
                console.log(id)
                //add to videos
                videos.push(id)
                setVideos(videos)
                //load next
                if (!videoObject){
                    loadNext()
                }
            }
        }
        //setSocket(new WebSocket("ws://localhost:8080"))
        socket.addEventListener('open', socketOpen)
        socket.addEventListener('message', socketMessage)
        loadNext()

        return ()=>{
            socket.removeEventListener('open', socketOpen)
            socket.removeEventListener('message', socketMessage)
        }
    },[socket, videoObject, videos])


    function onReady(event){
        setVideoObject(event.target)
        setShowVideo(true)
        event.target.playVideo();
        console.log("start")
    }

    function onEnd(_){
        setShowVideo(false)
        setVideoObject(null)
        loadNext()
        console.log("end")
    }

    function onError(err){
        console.log(err)
        this.onEnd()
    }

    function onStateChange(event){
        setVideoObject(event.target)
        console.log(event)
    }

    function youtube_parser(url){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        var match = url.match(regExp);
        return (match&&match[7].length==11)? match[7] : false;
    }

    function loadNext(){
        console.log(videos)
        let next = videos.pop()
        console.log(next)
        setVideos(videos)
        if (next){
            setVideoId(next)
            setShowVideo(true)
        }
    }

    return (
        <div>
            {showVideo &&
            <>
            {videoObject && <h3 className='video-title'>playing video: {videoObject.videoTitle}</h3>}
            <YoutubeComponent videoId={videoId} onReady={onReady} onEnd={onEnd} onError={onError} onStateChange={onStateChange}/>
            </>
            }
        </div>
    )

}

export default VideoPlayerPage;