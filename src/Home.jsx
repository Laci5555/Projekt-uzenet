import { getDocs, query, where } from 'firebase/firestore';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'

export default function Home({user, adatCollection}) {

    const [uzenetek, setUzenetek] = useState([]);

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
      getUzenetek()
    },[user])

    

    const navigate = useNavigate()

    function toProfile() {
        navigate("/login", { replace: true });
    }

  return (
    <div className='Home'>
      <div className="login" onClick={()=>toProfile()}>Profil</div>
      <div className="uzenetek">
        {uzenetek.map(x => "Feladó: " + x.felado + "Üzenet: " + x.uzenet + "Dátum: " + x.datum)}
      </div>
    </div>
  )
}
