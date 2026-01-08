import React from 'react'
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useEffect } from 'react';

export default function Login({auth, user, felhCollection}) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [signup, setSignup] = useState(false);

    const [semail, setSemail] = useState("");
    const [spass, setSpass] = useState("");
    const [spass2, setSpass2] = useState("");

    const [felhnev, setFelhnev] = useState("");
    const [nevid, setNevid] = useState("")
    const [ujnev, setUjnev] = useState("")

    const [photo, setPhoto] = useState("");
    const [currentkep, setCurrentkep] = useState("");

    const [r, refresh] = useState(false)

    useEffect(()=>{
        async function getUserstats() {
            const adatSnapshot = await getDocs(query(felhCollection, where("email", "==", user.email)));
            const adatList = adatSnapshot.docs.map(doc => ({ ...doc.data(), id:doc.id }));
            setFelhnev(adatList[0].nev)
            setNevid(adatList[0].id)
            setPhoto(adatList[0].photo)
        }
        getUserstats()
    },[user, r])

    async function login() {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.log(err);   
        }
    }

    async function googleLogin() {
        let result = (await signInWithPopup(auth, new GoogleAuthProvider()));
        let check = result.user.email;
        try{
            const adatSnapshot = await getDocs(query(felhCollection, where("email", "==", check)));
            // console.log("most nem kéne hozzáadni" + adatSnapshot.docs.length);
            if(adatSnapshot.docs.length == 0){
                await addDoc(felhCollection, {'email':check, 'nev':check.split('@')[0], 'photo':result.user.photoURL});
            }
        }catch(err){
            console.log(err);
        }
    }

    async function logout(){
        await signOut(auth)
        setEmail("")
        setPassword("")
    }

    const navigate = useNavigate()

    function toHome() {
        navigate("/", { replace: true });
    }

    async function Signup(){
        if(spass == spass2){
            await createUserWithEmailAndPassword(auth, semail, spass)
            await addDoc(felhCollection, {'email':semail, 'nev':semail.split('@')[0]});
        }else {
            console.log("nem egyezik a jelszó")
        }
    }


    async function updUsername() {
        await setDoc(doc(felhCollection, nevid), {'email':user.email, 'nev':ujnev, 'photo':photo});
        refresh(!r)
    }

    async function changePic() {
        await setDoc(doc(felhCollection, nevid), {'email':user.email, 'nev':felhnev, 'photo':currentkep});
        refresh(!r)
    }

    
  return (
    <div className="profil">
        <div className='bejelenzkezes'>
            {user ? <div className='info'>
                Email: {user.email} <br/> 
                Felhasználónév: {felhnev} <button onClick={()=>updUsername()}>Név módosítása</button> <input type="text" value={ujnev} onChange={e=>setUjnev(e.target.value)} /> <br/>
                Profilkép: <img src={photo} alt="Még nincs profilkép feltöltve..." /> <input type="text" placeholder='link' value={currentkep} onChange={e => setCurrentkep(e.target.value)} />
                <button onClick={()=>changePic()}>Profilkép módosítása</button> <br/>
                <button className='logout' onClick={()=>logout()}>logout</button>
            </div> : !signup ? <div className='urlap'>
                <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder='Email: '/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Jelszó: '/>
                <button onClick={()=>login()}>Bejelentkezés </button>
                <button onClick={()=>googleLogin()}>Bejelentkezés Google-el</button>
                <button onClick={()=>setSignup(true)}>Sign up</button>
            </div> : <div className='signup'>
                <input type="text" value={semail} onChange={e => setSemail(e.target.value)} placeholder='Email: '/>
                <input type="password" value={spass} onChange={e => setSpass(e.target.value)} placeholder='Jelszó: '/>
                <input type="password" value={spass2} onChange={e => setSpass2(e.target.value)} placeholder='Jelszó mégegyszer: '/>
                <button onClick={()=>Signup()}>Létrehozás</button>
                <button onClick={()=>setSignup(false)}>Bejelentkezés</button>
            </div>}
        </div>
        <button className="login" onClick={()=>toHome()}>Vissza</button>
    </div>
  )
}
