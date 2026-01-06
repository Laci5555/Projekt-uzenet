import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Home() {

    const navigate = useNavigate()

    function toProfile() {
        navigate("/login", { replace: true });
    }

  return (
    <div className='Home'>
      <div className="login" onClick={()=>toProfile()}>Profil</div>
      <div className="uzenetek">
        
      </div>
    </div>
  )
}
