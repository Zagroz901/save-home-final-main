import './Signup.css'

import React, { useState } from 'react'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import user_icon from '../Assets/person.png'
import { registerUser } from '../../API/api'
import { useNavigate } from 'react-router-dom';
export const Signup = () => {

    const navigator=useNavigate();
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    
    const signUp = async ()=>{
        const res = registerUser({email,password})
        console.log(res)
        navigator('/')
    }
    return (
        <div className='container'>
            <div className="header">
                <div className="text">Sign Up</div>
                <div className="underline"></div>
            </div>
            <div className="inputs">
                <div className="input">
                    <img src={user_icon} alt="" />
                    <input type="text" placeholder='Name'/>
                </div>
                <div className="input">
                    <img src={email_icon} alt="" />
                    <input onChange={(e)=>setEmail(e.target.value)} type="email" placeholder='Email'/>
                </div>
                <div className="input">
                    <img src={password_icon} alt="" />
                    <input onChange={(e)=>setPassword(e.target.value)} type="password" placeholder='Password'/>
                </div>
                <div className="input">
                    <img src={password_icon} alt="" />
                    <input type="password" placeholder='Confirm Password'/>
                </div>
            </div>
            <div className="submit-container">
                <div onClick={signUp} className="submit" >Sign Up</div>
            </div>
        </div>
    )
}
