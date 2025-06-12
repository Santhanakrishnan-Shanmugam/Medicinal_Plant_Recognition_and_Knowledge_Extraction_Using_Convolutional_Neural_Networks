import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import './App.css';

function App() {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(""); // Stores the result as text
  const [file, setFile] = useState(null); // For local file upload

  // Capture Image from Webcam
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot(); // Capture image
    setImage(imageSrc);
    setFile(dataURLtoFile(imageSrc, "captured.png")); // Convert to file
  };

  //  Handle Local File Upload
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile)); // Display preview
    }
  };

  //  Text-to-Speech Function (English & Tamil)
  const speakText = (text, language) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "tamil" ? "ta-IN" : "en-US"; // Set language
    synth.speak(utterance);
  };

  //  Send Image to Backend (Spring Boot)
  const uploadImage = async () => {
    if (!file) {
      alert("Please select or capture an image!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8080/api/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.error) {
        setPrediction(`Error: ${response.data.error}`);
      } else {
        const resultText = 
          `Plant: ${response.data.predicted_class}\n\n` +
          ` Benefits: ${response.data.benefits}\n\n` +
          ` Consumption Methods: ${response.data.consumption_methods}\n\n` +
          ` How to Eat: ${response.data.how_to_eat}`;
        
        setPrediction(resultText);

        // Read the result in English
        speakText(resultText, "english");

        // Translate & Read in Tamil
        const tamilText = 
          ` மரம்: ${response.data.predicted_class}\n\n` +
          ` நன்மைகள்: ${response.data.benefits}\n\n` +
          ` உணவு முறைகள்: ${response.data.consumption_methods}\n\n` +
          ` எப்படி சாப்பிடுவது: ${response.data.how_to_eat}`;

        setTimeout(() => speakText(tamilText, "tamil"), 3000); // Delay Tamil speech for clarity
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setPrediction("Failed to get prediction!");
    }
  };

  // Helper function: Convert Data URL to File
  const dataURLtoFile = (dataUrl, filename) => {
    let arr = dataUrl.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1> Plant Prediction System</h1>

      <Webcam ref={webcamRef} screenshotFormat="image/png" />
      <br />
      <button onClick={capture}>📸 Capture from Webcam</button>
      <br /><br />
      
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br /><br />

      {image && <img src={image} alt="Uploaded Preview" style={{ width: "300px", borderRadius: "10px" }} />}
      <br /><br />

      <button onClick={uploadImage}> Upload & Predict</button>
      <br /><br />

      {/* Display Prediction Result */}
      {prediction && (
        <div style={{ whiteSpace: "pre-line", fontSize: "18px", fontWeight: "bold", color: "green", padding: "10px", border: "2px solid green", borderRadius: "10px" }}>
          {prediction}
          <br /><br />
          <button onClick={() => speakText(prediction, "english")}> Speak in English</button>
          <button onClick={() => speakText(prediction, "tamil")}> தமிழ் பேசவும்</button>
        </div>
      )}
    </div>
  );
}

export default App;
