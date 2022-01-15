import logo from "./logo.svg";
import React from "react";
import "./App.css";
import { Start, Next, Stop, setConectStatus } from "./conection";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [value, setValue] = React.useState(false);
  const [valueHide, setValueHide] = React.useState(false);
  setConectStatus(setValueHide);
  const next = () => {
    Next();
  };

  const start = () => {
    setValue(!value);
    Start();
  };

  const stop = () => {
    setValue(!value);
    Stop();
  };

  return (
    <div className="App">
      <div className="d-flex w-100">
        <div className="col-6 mt-3 px-2">
          <video id="localVideo" muted autoPlay />
        </div>{" "}
        <div className="col-6 mt-3 px-2">
          <div
            className={valueHide ? "h-100" : "h-100 hider"}
            id="remoteVideoHide"
          >
            <video
              className={valueHide ? "" : " hide"}
              id="remoteVideo"
              muted
              autoPlay
            />
          </div>
        </div>{" "}
      </div>{" "}
      <div className="mx-auto d-flex w-100 px-3 mt-3">
        <div className="px-2 col-4">
          <button
            id="next"
            className={
              value ? "btn btn-primary btn-lg" : "btn btn-primary btn-lg hide"
            }
            onClick={next}
          >
            Next
          </button>
        </div>
        <div className="px-2 col-4">
          <button
            id="stop"
            className={
              value ? "btn btn-primary btn-lg" : "btn btn-primary btn-lg hide"
            }
            onClick={stop}
          >
            Stop
          </button>
        </div>
        <div className="px-2 col-4">
          <button
            id="start"
            className={
              value ? "btn btn-primary hide btn-lg" : "btn btn-primary btn-lg"
            }
            onClick={start}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
