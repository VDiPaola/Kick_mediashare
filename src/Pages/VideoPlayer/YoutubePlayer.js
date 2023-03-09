import YouTube from 'react-youtube';
import React from 'react';

class YoutubeComponent extends React.Component {
  constructor(props){
    super(props)
    let startTime = props.videoId.split("?t=")
    startTime = startTime.length > 1 ? startTime[1] : 0
    this.state = {
      opts: {
        height: window.innerHeight,
        width: window.innerWidth,
        playerVars: {
          autoplay: 1,
          controls: 1,
          start:startTime,
          enablejsapi: 1,
          fs:0,
          origin:"http://localhost"
        }
      }
    }

    window.addEventListener('resize', ()=>{
      let opts = this.state.opts
      opts.width = window.innerWidth
      opts.height = window.innerHeight
      this.setState({opts})
    })
  }

  render() {
    return (
    <div>
      <YouTube videoId={this.props.videoId} opts={this.state.opts} 
      onReady={this.props.onReady} 
      onEnd={this.props.onEnd} 
      onError={this.props.onError} 
      onStateChange={this.props.onStateChange} 
      />;
    </div>
    )
  } 

  
}

export default YoutubeComponent