import { addDoc, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

export default function Admin({felhCollection, blacklistCollection, db}) {

    const [emails, setEmails] = useState([]);

    const [r, refresh] = useState(false)
    

    useEffect(()=>{
        async function getUsers() {
            const adatSnapshot = await getDocs(felhCollection);
            const adatList = adatSnapshot.docs.map(doc => ({ ...doc.data(), id:doc.id }));
            setEmails(adatList);
        }
        getUsers()
    },[r])


    const navigate = useNavigate()

    function toHome() {
        navigate("/", { replace: true });
    }

    async function banUser(email){
        let prev = {}
        emails.forEach(x => {
            if(x.email == email){
                prev = x
            }
        })
        if(prev.ban == "true"){
            await setDoc(doc(felhCollection, prev.id), {'ban':"false", 'email':prev.email, 'nev':prev.nev, 'bio':prev.bio, 'photo':prev.photo}); 
        }else if(prev.ban == "" || prev.ban == "false"){
            await setDoc(doc(felhCollection, prev.id), {'ban':"true", 'email':prev.email, 'nev':prev.nev, 'bio':prev.bio, 'photo':prev.photo});
        }
        refresh(!r)
    }

    

  return (
    <div className='adminfelulet'>
        <div className="headline">👥 Admin felület <span className='iksz' onClick={()=>toHome()}>X</span></div>
        <div className="felhasznalok">
            {emails.map(x => x.email!="nyitrailaszlo0729@gmail.com" ? <div>Email: {x.email}, Név: {x.nev} <input type="checkbox" checked={x.ban=="true"?true:false} onClick={()=>banUser(x.email)} /></div>:"")}
        </div>
    </div>
  )
}
