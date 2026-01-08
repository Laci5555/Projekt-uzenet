import { getDocs } from 'firebase/firestore';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

export default function Admin({user, adatCollection, felhCollection}) {

    const [emails, setEmails] = useState([]);

    useEffect(()=>{
        async function getUsers() {
            const adatSnapshot = await getDocs(felhCollection);
            const adatList = adatSnapshot.docs.map(doc => ({ ...doc.data(), id:doc.id }));
            setEmails(adatList);
        }
        getUsers()
    },[])


    const navigate = useNavigate()

    function toHome() {
        navigate("/", { replace: true });
    }

    function torolUser(){
        
    }

  return (
    <div>
        <div className="felhasznalok">
            {emails.map(x => <div>Email: {x.email}, Név: {x.nev} <button onClick={()=>torolUser()}>Törlés</button></div>)}
        </div>
        <button className="login" onClick={()=>toHome()}>Vissza</button>
    </div>
  )
}
