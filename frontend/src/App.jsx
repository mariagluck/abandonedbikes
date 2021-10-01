import { useState } from "react";
import React from "react";
import L from "leaflet";
import axios from "axios";

import "leaflet/dist/leaflet.css";
import "./main.css";
import icon from "leaflet/dist/images/marker-icon.png";
import Map from "./Map.jsx";

export default function App() {
  const [position, setPosition] = useState(null);
  const [desc, setDesc] = useState("");
  const [reports, setReports] = useState([]);

  // Configure leaflet Marker icon - without this it is broken 💩
  // Wow this kind of sucks and was super hard to find!
  const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: null });
  L.Marker.prototype.options.icon = DefaultIcon;

  console.log("BACKEND RUNNING AT " + process.env.REACT_APP_BACKEND);

  async function printReports() {
    const url = process.env.REACT_APP_BACKEND + "notifications";
    //Print all abandoned bicycle reports from the backend
    await axios.get(url)
     .then((result) => {
       console.log("data has been received")
       setReports(result.data)
       console.log(result.data)
     })
     .catch(error => {
            console.log(error)  
          });
  }

  async function report() {
    // TODO: Send abandoned bicycle report to the backend
    const url = process.env.REACT_APP_BACKEND + "notifications";
    const report = {
      position: position.lat + "," + position.lng,
      description: desc,
    };

    const result = await axios.post(url, report);
    if (result.data && result.data.success) {
      alert(
        `Your report has been registered! \nThe description of the abandoned bike is:\n${desc}.`
      );
      setDesc("");
      setPosition(null);
    } else {
      alert(`failed!`);
    }
  }

  return (
    <div className="form">
      <Map position={position} setPosition={setPosition} />
      <div className="form-fields">
        <h3>Report abandoned bicycle</h3>
        {position && (
          <>
            GPS: {position.lat}, {position.lng}
          </>
        )}
        <br />
        <textarea
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Write short description here"
          value={desc}
        />
        <button onClick={report}>Send report</button>
     
      <div className="allReports">
        <button onClick={printReports}>View all reports filed:</button>
        <div className="reportList">{reports.map(rep => {
          return(
            <div>
              <p key={rep._id}><h5>Location:</h5> {rep.position}</p>
            <p key={rep._id}><h5>Description:</h5> {rep.description}</p>
            <hr></hr>
            </div> 
          )
        })}
        </div>
      </div>
    </div>
  </div>
       
  );
}
