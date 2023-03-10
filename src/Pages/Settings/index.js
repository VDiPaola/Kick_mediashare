const ip = "192.168.0.31"
const port = process.env.REACT_APP_BACKEND_PORT

const Button = (props) => {
    return (
        <div className="button" onClick={props.handleClick}>
            {props.text}
        </div>
    )
}


//["0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"]
const playbackRates = ["0.25", "0.5", "1", "1.5", "1.75", "2"]

const request = (message, data={}) => {
    fetch(`http://${ip}:${port}/video`, {
        body: JSON.stringify({...data, message}),
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    })
}


const SettingsPage = (props) => {
    const handlePlay = ()=>{
        request("video_play")
    }
    const handlePause = ()=>{
        request("video_pause")
    }
    const handleSkip = ()=>{
        request("video_skip")
    }
    const handleSpeedChange = (e)=>{
        let speed = e.target.innerText
        request("video_speed", {speed})
    }

    const handleTimeForward = (e)=>{
        request("video_forward")
    }
    const handleTimeBack = (e)=>{
        request("video_back")
    }
    const handleVolumeSliderChange = (e)=>{
        let volume = e.target.value
        request("video_volume", {volume})
    }

    return (
        <div>
            <Button text="Play" handleClick={handlePlay}/>
            <Button text="Pause" handleClick={handlePause}/>
            <Button text="Skip" handleClick={handleSkip}/>
            <div className="speed-container">
                {playbackRates.map((rate,i)=>(
                    <div key={i} onClick={handleSpeedChange}>{rate}</div>
                ))}
            </div>
            <div className="speed-container">
                <div onClick={handleTimeBack}>back</div>
                <div onClick={handleTimeForward}>forward</div>
            </div>
            <div className="slidecontainer">
                <p>Volume Slider</p>
                <input type="range" min="0" max="100" className="slider" onChange={handleVolumeSliderChange} orient="vertical" id="myRange" />
            </div>
        </div>
    )
}

export default SettingsPage;