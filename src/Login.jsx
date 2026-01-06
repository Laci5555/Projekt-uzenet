import React from 'react'
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { useState } from 'react';

export default function Login({auth, user}) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function login() {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.log(err);   
        }
    }

    async function googleLogin() {
        await signInWithPopup(auth, new GoogleAuthProvider());
    }

    async function logout(){
        await signOut(auth)
        setEmail("")
        setPassword("")
    }

  return (
    <div className='bejelenzkezes'>
        {user ? <div className='info'>
            Info: {user.email} <span className='logout' onClick={()=>logout()}>logout</span>
        </div> : <div className='urlap'>
            <input type="text" name="" id="" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="text" name="" id="" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={()=>login()}>Bejelentkezés </button>
            <button onClick={()=>googleLogin()}>Bejelentkezés Google-el</button>
        </div>}
      
    </div>
  )
}
