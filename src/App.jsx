import './App.css'
import { firebaseConfig } from "/firebaseConfig.js";
import { initializeApp } from "firebase/app";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './Home';
import Login from './Login';
import { collection, getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useEffect, useState } from 'react';
import NotFound from './NotFound';
import Admin from './Admin';


function App() {

  

  const app = initializeApp(firebaseConfig);
  
  const db = getFirestore(app);
  const adatCollection = collection(db, 'uzenetek');
  const felhCollection = collection(db, 'felhasznalok');

  const auth = getAuth(app);

  const [user, setUser] = useState({});

  

  useEffect(()=>{
       onAuthStateChanged(auth, (currentUser) => setUser(currentUser)); // useEffect!
  },[])

  const router = createBrowserRouter([
    { path: "/", element: <Home user={user} adatCollection={adatCollection} felhCollection={felhCollection}/> },
    { path: "/login", element: <Login auth={auth} user={user} felhCollection={felhCollection}/> },
    { path: "/admin", element: <Admin felhCollection={felhCollection}/> },
    { path: "*", element: <NotFound /> },
  ]);

  // console.log("user:", user);

  return (
    <div className=''>
      <RouterProvider router={router}/>
    </div>
  )
}

export default App
