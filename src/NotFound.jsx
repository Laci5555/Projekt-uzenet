import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function NotFound() {

  const navigate = useNavigate()

    function toHome() {
        navigate("/", { replace: true });
    }

  return (
    <div className='adminfelulet'>
        <div className="headline"> Not Found <span className='iksz' onClick={()=>toHome()}>X</span></div>
        <div className="felhasznalok">
            A keresett oldal nem található... :c
        </div>
    </div>
  )
}
