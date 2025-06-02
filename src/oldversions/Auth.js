import { auth, provider } from '../firebase-config.js';
import { signInWithPopup } from 'firebase/auth';
import '../styles/Auth.css';
// import { useState } from 'react';

import Cookies from 'universal-cookie'
const cookies = new Cookies();

export const Auth = (props) => {
    const {setIsAuth} = props;
    // const [username, setUsername] = useState("");

    const signInWithGoogle = async () => {
        try{
            const result = await signInWithPopup(auth, provider);
            cookies.set("auth-token", result.user.refreshToken);
            cookies.set("uid", result.user.uid);

            let savedUsername = cookies.get("username");
            if(!savedUsername){
                const enteredUsername = "Anonymous" + Math.floor(Math.random() * 999);
                if(enteredUsername){
                    cookies.set("username", enteredUsername);
                }
            }

            setIsAuth(true);
        } catch (err){
            console.error(err);
        }
    };

    return( 
    <div className="auth">
        <button onClick={signInWithGoogle}>google sign in</button>
    </div>
    );
}