import { addDoc, getDocs, query, Timestamp, where } from 'firebase/firestore';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'

export default function Home({user, adatCollection, felhCollection}) {

    const [uzenetek, setUzenetek] = useState([]);
    const [emails, setEmails] = useState([]);

    const [target, setTarget] = useState("");

    const [currentUzenet, setCurrentUzenet] = useState("");

    useEffect(()=>{
      async function getUzenetek() {
        if(user){
          const adatSnapshot = await getDocs(query(adatCollection, where("fogado", "==", user.email)));
          const adatList = adatSnapshot.docs.map(doc => ({ ...doc.data(), id:doc.id }));
          setUzenetek([...adatList])
        }else{
          setUzenetek(["Nincs felhasználó bejelentkezve"])
        }
      }
      async function getUsers() {
          const adatSnapshot = await getDocs(felhCollection);
          const adatList = adatSnapshot.docs.map(doc => ({ ...doc.data(), id:doc.id }));
          setEmails(adatList);
          setTarget(adatList[0].email)
      }
      getUzenetek()
      getUsers()
    },[user])

    

    const navigate = useNavigate()

    function toProfile() {
        navigate("/login", { replace: true });
    }


    async function sendUzenet() {
      await addDoc(adatCollection, {'datum':'5', 'felado':user.email, 'fogado':target, 'uzenet':currentUzenet}); 
    }

    function goAdmin() {
      navigate("/admin", { replace: true });
    }

    console.log(target);
    

  return (
    <div className='Home'>
      <div className="login" onClick={()=>toProfile()}>Profil</div>
      <div className="uzenetek">
        {uzenetek.map(x => "Feladó: " + x.felado + "Üzenet: " + x.uzenet + "Dátum: " + x.datum)}
      </div>
      <div className="send">
        <select name="" id="" value={target} onChange={e => setTarget(e.target.value)}>
          {emails.map(x => <option value={x.email} key={x.email}>{x.email}</option>)}
        </select>
        <textarea onChange={e => setCurrentUzenet(e.target.value)} value={currentUzenet} className='uzenetbox'></textarea>
        <button onClick={()=>sendUzenet()}>Üzenet küldése</button>
      </div>
      <div className="admin">
        <button className='admingomb' onClick={()=>goAdmin()}>Admin</button>
      </div>
    </div>
  )
}
