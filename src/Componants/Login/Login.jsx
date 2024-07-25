import './Login.css'

import React, { useState } from 'react'
import email_icon from '../Assets/email.png'
import password_icon from '../Assets/password.png'
import { useNavigate } from 'react-router-dom';
import user_icon from '../Assets/person.png'
import { loginUser} from '../../API/api';

export const Login = () => {
    const navigate = useNavigate();
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const handleCreateAccountClick = () => {
        navigate('/signup');
    };
    
    const login= async ()=>{
        const res=loginUser({email,password})
        console.log(res)
    }   
    return (
        <div className='container'>
            <div className="header">
                <div className="text">Login</div>
                <div className="underline"></div>
            </div>
            <div className="inputs">
                <div className="input">
                    <img src={email_icon} alt="" />
                    <input onChange={(e)=>setEmail(e.target.value)} type="email" placeholder='Email'/>
                </div>
                <div className="input">
                    <img src={password_icon} alt="" />
                    <input onChange={(e)=>setPassword(e.target.value)} type="password" placeholder='Password'/>
                </div>
            </div>
            <div className="submit-container">
                <div onClick={login} className="submit" >Login</div>
            </div>
            <div className="creat-account" onClick={handleCreateAccountClick}><span>create account</span></div>
            <div className="forgot-password">Lost Password <span>Click her</span></div>
        </div>
    )
}
