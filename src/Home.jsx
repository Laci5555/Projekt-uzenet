import { addDoc, getDocs, or, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'

export default function Home({user, adatCollection, felhCollection}) {

    const [uzenetek, setUzenetek] = useState([]);
    const [emails, setEmails] = useState([]);

    const [target, setTarget] = useState("");

    const [currentUzenet, setCurrentUzenet] = useState("");

    const [chatIndex, setChatIndex] = useState(-1);

    const [profilok, setProfilok] = useState([]);

    const [friends, setFriends] = useState([])

    const [r, refresh] = useState(false);
    

    useEffect(()=>{
      function createKey(a,b){
        return [a,b].sort().join("__");
      }

      async function getUzenetek() {
        if(user){
          const q = query(
            adatCollection,
            or(
              where("fogado", "==", user.email),
              where("felado", "==", user.email)
            ),
            orderBy("datum", "asc") // vagy "desc"
          );
          const adatSnapshot = await getDocs(q);
          const adatList = adatSnapshot.docs.map(doc => ({ ...doc.data(), id:doc.id }));
          const grouped = {}
          const friendsSet = new Set(); 
          adatList.forEach(msg => {
            const key = createKey(msg.felado, msg.fogado);
            if(!grouped[key]){
              grouped[key] = {
                participants:[msg.felado,msg.fogado].sort(),
                messages:[]
              }
            }
            grouped[key].messages.push(msg);
            console.log(msg.felado, msg.fogado);
            
            if (msg.felado !== user.email) friendsSet.add(msg.felado);
            if (msg.fogado !== user.email) friendsSet.add(msg.fogado);
          })
          setUzenetek(Object.values(grouped))
          setFriends([...friendsSet])
        }else{
          setUzenetek([])
          setFriends([])
        }
      }
      getUzenetek()
    },[user, r])

    useEffect(()=>{
      async function getUsers() {
          const adatSnapshot = await getDocs(felhCollection);
          const adatList = adatSnapshot.docs.map(doc => ({ ...doc.data(), id:doc.id }));
          const allEmails = adatList.map(u => u.email).filter(Boolean);
          const filteredEmails = allEmails.filter(
            email =>
              email !== user?.email &&     // ne saját magad
              !friends.includes(email)     // ne legyen friend
          );
          setEmails(filteredEmails);
          setProfilok(adatList)
      }
      getUsers()
    },[user, friends])

    

    const navigate = useNavigate()

    function toProfile() {
        navigate("/login", { replace: true });
    }


    async function sendUzenet() {
      if(currentUzenet!=""){
        await addDoc(adatCollection, {'datum':serverTimestamp(), 'felado':user.email, 'fogado':target, 'uzenet':currentUzenet});
        refresh(!r)
      }
    }

    function goAdmin() {
      navigate("/admin", { replace: true });
    }

    function loadChat(i){
      setChatIndex(i);
      setTarget(user.email==uzenetek[i].participants[0]?uzenetek[i].participants[1]:uzenetek[i].participants[0])
    }


    // console.log(target);
    // console.log("ghaélgéag", profilok);

    function getProfil(email) {
      return profilok.filter(x => x.email == email)
    }
    
    function showProfil(ember) {
      console.log(getProfil(ember)[0]);
    }

    function showNewMessageWindow(){

    }

    async function ujBeszelgetes(ember) {
      console.log("ájhrlnhaálknháa");
      
      await addDoc(adatCollection, {'datum':serverTimestamp(), 'felado':user.email, 'fogado':ember, 'uzenet':""});
      refresh(!r)
    }

    console.log(friends);
    console.log(emails);

    const urlRegex = /(https?:\/\/[^\s]+)/g;

    function isImageUrl(url) {
      return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
    }
    
    function renderMessage(text) {
      const parts = text.split(urlRegex);

      return parts.map((part, i) => {
        if (part.match(urlRegex)) {
          if (isImageUrl(part)) {
            return (
              <img
                key={i}
                src={part}
                alt="kép"
                className="chat-image"
              />
            );
          }

          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </a>
          );
        }

        return <span key={i}>{part}</span>;
      });
    }
    

  return (
    <div className=''>
      <div className="login" onClick={()=>toProfile()}>Profil</div>
      {!user?"Nincs bejelentkezve" : <div className='Home'>
        <div className="uzenetek">
        {profilok.length==0? "Betöltés..." : uzenetek.length==0? "Nincs megjeleníthető beszélgetés" : uzenetek.map((uzenet,i) => <div key={i} onClick={()=>loadChat(i)}>{getProfil(user.email==uzenet.participants[0]?uzenet.participants[1]:uzenet.participants[0])[0].nev} <img className='profilkep' src={getProfil(user.email==uzenet.participants[0]?uzenet.participants[1]:uzenet.participants[0])[0].photo} /></div>)}
      </div>
      <div className="uzenetek">
        {chatIndex!=-1? profilok.length==0? "Betöltés..." : uzenetek[chatIndex].messages.map(x => x.uzenet==""?"":<div className={x.felado==user.email?"tolem":"nemtolem"} onClick={()=>showProfil(x.felado)}>{getProfil(x.felado)[0].nev} | {renderMessage(x.uzenet)}</div>):""}
      </div>
      <div className="send">
        {/* <button onClick={()=>showNewMessageWindow()}>Új beszélgetés</button> */}
        <div>
          {emails.map(x => <div onClick={()=>ujBeszelgetes(x)}>{x}</div>)}
        </div>
        <textarea onChange={e => setCurrentUzenet(e.target.value)} value={currentUzenet} className='uzenetbox'></textarea>
        <button onClick={()=>sendUzenet()}>Üzenet küldése</button>
      </div>
      {user?.email=="nyitrailaszlo0729@gmail.com"?<div className="admin">
        <button className='admingomb' onClick={()=>goAdmin()}>Admin</button>
      </div>:""}
        </div>}
    </div>
  )
}
