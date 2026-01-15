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

    const [photo, setPhoto] = useState("");
    const [currentkep, setCurrentkep] = useState("");
    const [bio, setBio] = useState("");

    const [r, refresh] = useState(false)

    const [isbanned, setIsbanned] = useState(false)

    useEffect(()=>{
        async function getUserstats() {
            if(user){
                const adatSnapshot = await getDocs(query(felhCollection, where("email", "==", user.email)));
                const adatList = adatSnapshot.docs.map(doc => ({ ...doc.data(), id:doc.id }));
                setFelhnev(adatList[0].nev)
                setNevid(adatList[0].id)
                setPhoto(adatList[0].photo)
                setBio(adatList[0].bio)
            }
        }
        getUserstats()
        async function checkBanned() {
            if(user){
                const adatSnapshot = await getDocs(query(felhCollection, where("email", "==", user.email)));
                const adatList = adatSnapshot.docs.map(doc => ({ ...doc.data(), id:doc.id }));
                adatList[0].ban=="true"?setIsbanned(true):setIsbanned(false)
            }
        }
        checkBanned()
    },[user, r])

    

    async function login() {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.log(err); 
            showerrorMessage("Hibás jelszó vagy email")
        }
    }

    async function googleLogin() {
        let result = (await signInWithPopup(auth, new GoogleAuthProvider()));
        let check = result.user.email;
        try{
            const adatSnapshot = await getDocs(query(felhCollection, where("email", "==", check)));
            // console.log("most nem kéne hozzáadni" + adatSnapshot.docs.length);
            if(adatSnapshot.docs.length == 0){
                await addDoc(felhCollection, {'email':check, 'nev':check.split('@')[0], 'photo':result.user.photoURL, 'bio':""});
            }
        }catch(err){
            console.log(err);
            showerrorMessage("Hiba a bejelentkezés során")
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
            try {
                await createUserWithEmailAndPassword(auth, semail, spass)
                await addDoc(felhCollection, {'email':semail, 'nev':semail.split('@')[0], 'photo':"https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80", 'bio':""});            
            } catch (err) {
                showerrorMessage("Ellenőrízd az internetkapcsolatod (lehet hogy ez az email már használatban van)")
            }
        }else {
            console.log("Nem egyezik a jelszó")
            showerrorMessage("Nem egyezik a jelszó")
        }
    }

    async function changeProfil() {
        await setDoc(doc(felhCollection, nevid), {'email':user.email, 'nev':felhnev, 'photo':photo, 'bio':bio});
    }

    const [error, setError] = useState(false)
    const [hibauzenet, setHibauzenet] = useState("");

    function showerrorMessage(mes) {
        setHibauzenet(mes)
        setError(true)
    }

    function closeError(){
        setHibauzenet("")
        setError(false)
    }

    
  return (
    <div className="profil">
        <div className='bejelenzkezes'>
            {user ? isbanned? <div className='bannedWindow'>
                    <div className="headline">🚨 Hiba <span className='iksz' onClick={()=>logout()}>X</span></div>
                    <div className="bannedbelso"><span>A felhasználó letiltva :c </span></div>
                </div> : <div className='info'>
                <div className="headline">🙍‍♂️ Profil <span className='iksz' onClick={()=>toHome()}>X</span></div>
                <div className="infobelso">
                <div className="vbox">
                    <div className="hbox">
                        <div className="infoemail">Email: {user.email} </div>
                        <div className="infonev">Felhasználónév: <input type="text" value={felhnev} onChange={e=>setFelhnev(e.target.value)} /></div>
                    </div>
                    <div className="infokep"><img className='profilkep' src={photo} alt="Még nincs profilkép feltöltve..." /> <input type="text" placeholder='link' value={photo} onChange={e => setPhoto(e.target.value)} /> <br/></div>   
                </div>
                    <div className="infobio"><textarea className='bio' value={bio} onChange={e=>setBio(e.target.value)}></textarea></div>
                    <button onClick={()=>changeProfil()} className='mentes'>Változtatások mentése</button>
                    <button className='logout' onClick={()=>logout()}>Kijelentkezés</button>
                </div>
            </div> : !signup ? <div className='urlap'>
                <div className="headline">➜] Bejelentkezés <span className='iksz' onClick={()=>toHome()}>X</span></div>
                <div className="urlapbelso">
                    <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder='Email: '/>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Jelszó: '/>
                    <button onClick={()=>login()}>Bejelentkezés </button>
                    <button onClick={()=>googleLogin()}> <img src="google.png" alt="" className='googleicon'/> Bejelentkezés Google-el</button>
                    <button onClick={()=>setSignup(true)}>Regisztrálás</button>
                </div>
            </div> : <div className='signup'>
                <div className="headline">📄 Regisztráció <span className='iksz' onClick={()=>toHome()}>X</span></div>
                <div className="signupbelso">
                    <input type="text" value={semail} onChange={e => setSemail(e.target.value)} placeholder='Email: '/>
                    <input type="password" value={spass} onChange={e => setSpass(e.target.value)} placeholder='Jelszó: '/>
                    <input type="password" value={spass2} onChange={e => setSpass2(e.target.value)} placeholder='Jelszó mégegyszer: '/>
                    <button onClick={()=>Signup()} disabled={error}>Létrehozás</button>
                    <button onClick={()=>setSignup(false)}>Bejelentkezés</button>
                </div>
            </div>}
        </div>
        {!error?"":
        <div className="errormessage">
            <div className="headline">🚨 Hiba <span className='iksz' onClick={()=>closeError()}>X</span></div>
            <div className="errorbelso">
                {hibauzenet}
            </div>
        </div>}
    </div>
  )
}
