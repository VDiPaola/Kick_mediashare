import React from 'react';
import App from './App';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit'
import {Provider, connect} from "react-redux";

//setup redux

//action types
const VIDEO_ADD = "VIDEO_ADD";

const videoAddAction = (videoId) =>({
  videoId,
  type: VIDEO_ADD
});



//reducer
const defaultState = {
  videos:[]
}
const reducer = (state = defaultState, action)=>{
  switch(action.type){
    case VIDEO_ADD: {
      //update state
      state.videos.push(action.videoId)
      return state;
    }
    default: return state;
  }
}

const store = configureStore({reducer});
//bind to props
const bindPropsToState = (state) => ({
  videos: state.videos
})
const bindPropsToAction = (dispatch) => ({
  submitVideoAddAction: (videoId)=>dispatch(videoAddAction(videoId))
})



//render
const Connected = connect(bindPropsToState,bindPropsToAction)(App)

const Root = () => (
  <Provider store={store}>
    <Connected />
  </Provider>
)



const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(<Root />);