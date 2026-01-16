import { addDoc, getDocs, or, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import React from 'react'
import { useRef } from 'react';
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
        setCurrentUzenet("")
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
      console.log(email);
      
      return profilok.filter(x => x.email == email)
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
    
    function formatRelativeDate(firebaseTimestamp) {
      if (!firebaseTimestamp) return "";

      const date = firebaseTimestamp.toDate();
      const now = new Date();

      const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (date >= today) {
        return "Ma";
      }

      if (date >= yesterday) {
        return "Tegnap";
      }

      return date.toLocaleDateString("hu-HU", {
        month: "long",
        day: "numeric",
      });
    }

    const containerRef = useRef(null)
    const isAtBottomRef = useRef(true);

    function handleScroll() {
      const el = containerRef.current;
      if (!el) return;

      const threshold = 50; // px
      isAtBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      if (isAtBottomRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    }, [uzenetek]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      // chat váltáskor mindig alul kezd
      el.scrollTop = el.scrollHeight;
      isAtBottomRef.current = true;
    }, [chatIndex]);


    function closeChat() {
      setChatIndex(-1)
    }

    const [popup, showpopup] = useState(false)

    const [currentprofile, setCurrentProfile] = useState({})

    const [seeprof, setSeeprof] = useState(false)

    function showProfil(ember) {
      console.log(getProfil(ember)[0]);
      setCurrentProfile(getProfil(ember)[0])
      setSeeprof(true)
    }

    function closeprof() {
      setSeeprof(false)
    }

    function showNewMessageWindow(){
      showpopup(true)
    }

    function closepopup() {
      showpopup(false)
    }

    

  return (
    <div className=''>
      <div className="login" onClick={()=>toProfile()}>Profil</div>
      {!user?<div className='bannedWindow nincsbej'>
                    <div className="headline">A folytatáshoz jelentkezzen be <span className='iksz' onClick={()=>logout()}>X</span></div>
                    <div className="bannedbelso nincsbejbelso"><span>Tovább a bejelentkezéshez</span><img onClick={()=>toProfile()} src="login.png" alt="" className='googleicon bejicon' /></div>
                </div> : <div className='Home'>
        <div className="emberek">
          <div className="headline">👥 Barátok <span className='iksz'>X</span></div>
        {profilok.length==0? "Betöltés..." :
         uzenetek.length==0? <div className="emberekesen">
          <div className="en"  onClick={()=>toProfile()}><img className='profilkep' src={getProfil(user.email)[0].photo} /> Felhasználónév: <br /> {getProfil(user.email)[0].nev}</div>
          <div className="emberekbelso"><span className='nincsbeszel'>Nincs megjeleníthető beszélgetés</span><div className="hozzaadas" onClick={()=>showNewMessageWindow()}>+</div></div>
          </div> :
         <div className="emberekesen">
          <div className="en"  onClick={()=>toProfile()}><img className='profilkep' src={getProfil(user.email)[0].photo} /> Felhasználónév: <br /> {getProfil(user.email)[0].nev}</div>
          <div className="emberekbelso">
            {uzenetek.map((uzenet,i) => <div key={i} onClick={()=>loadChat(i)} onDoubleClick={()=>showProfil(user.email==uzenet.participants[0]?uzenet.participants[1]:uzenet.participants[0])} className='emberke'><img className='profilkep' src={getProfil(user.email==uzenet.participants[0]?uzenet.participants[1]:uzenet.participants[0])[0].photo} />{getProfil(user.email==uzenet.participants[0]?uzenet.participants[1]:uzenet.participants[0])[0].nev} </div>)}
            <div className="hozzaadas" onClick={()=>showNewMessageWindow()}>+</div>
          </div>
         </div>}
      </div>
      {chatIndex===-1? "" : <div className="uzenetek" ref={containerRef} onScroll={handleScroll}>
        <div className="headline">💬 Csevegés <span className='iksz' onClick={()=>closeChat()}>X</span></div>
        {chatIndex!=-1? profilok.length==0? "Betöltés..." : uzenetek[chatIndex].messages.map(x => x.uzenet==""?"":<div className={x.felado==user.email?"tolem":"nemtolem"} onClick={()=>showProfil(x.felado)}><div className='uzenetnev'>{getProfil(x.felado)[0].nev}</div> <div className='uzenetuzenet'>{renderMessage(x.uzenet)}</div> <div className="uzenetdatum">{formatRelativeDate(x.datum)}</div></div>):""}
      </div>}
      {chatIndex===-1?"": <div className="send">
        {/* <button onClick={()=>showNewMessageWindow()}>Új beszélgetés</button>
        <div>
          {emails.map(x => <div onClick={()=>ujBeszelgetes(x)}>{x}</div>)}
        </div> */}
        <textarea placeholder='> _' onChange={e => setCurrentUzenet(e.target.value)} value={currentUzenet} className='uzenetbox'></textarea>
        <button onClick={()=>sendUzenet()} className={chatIndex===-1?"uzenetgomb kikapcs":"uzenetgomb"} disabled={chatIndex===-1}>⌯⌲</button>
      </div>}
      {user?.email=="nyitrailaszlo0729@gmail.com"?<div className="admin">
        <button className='admingomb' onClick={()=>goAdmin()}>⏻</button>
      </div>:<div className="admin">
        <button className='admingomb'>⏻</button>
      </div>}
        </div>}
        {!popup?"":
        <div className="addnew">
          <div className="headline">Beszélgetés indítása<span className='iksz' onClick={()=>closepopup()}>X</span></div>
          <div className="addnewbelso">
            {emails.map(x => <div onClick={()=>ujBeszelgetes(x)} className='emberke'>{x}</div>)}
          </div>
        </div>}
        {!seeprof?"":<div className='info homeprof'>
                <div className="headline">🙍‍♂️ {currentprofile.nev} Profilja <span className='iksz' onClick={()=>closeprof()}>X</span></div>
                <div className="infobelso">
                <div className="vbox">
                    <div className="hbox">
                        <div className="infoemail">Email: {currentprofile.email} </div>
                        <div className="infonev">Felhasználónév: {currentprofile.nev}</div>
                    </div>
                    <div className="infokep"><img className='profilkep' src={currentprofile.photo} alt="Még nincs profilkép feltöltve..." /><br/></div>   
                </div>
                    <div className="infobio"><div className='bio' value={currentprofile.bio} onChange={e=>setBio(e.target.value)}></div></div>
                </div>
            </div>}
    </div>
  )
}
