import { useState } from 'react'
import './App.css'
import { initializeApp } from "firebase/app";

function App() {
  const [count, setCount] = useState(0)

  const firebaseConfig = {
    apiKey: "AIzaSyBgcM_6mR8IgQZrOnLDVhoZrbmKtvIoq_s",
    authDomain: "uzenet-658ef.firebaseapp.com",
    projectId: "uzenet-658ef",
    storageBucket: "uzenet-658ef.firebasestorage.app",
    messagingSenderId: "910506603720",
    appId: "1:910506603720:web:461401c78894927b5b61fd"
  };

  const app = initializeApp(firebaseConfig);

  return (
    <>
      
    </>
  )
}

export default App
