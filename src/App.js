import VideoPlayerPage from './Pages/VideoPlayer';
import SettingsPage from './Pages/Settings';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App(props) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<VideoPlayerPage videos={props.videos}/>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}