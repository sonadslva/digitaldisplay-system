import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword } from './Firebase';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if the logged-in user is the Superadmin
            if (user.uid === '43QZgDQCY2OjJehFPyoldb8LnHo1') {
                navigate('/Superadmin');
            } else {
                navigate('/Home'); // Default page for other users
            }
        } catch (error) {
            setError('Invalid email or password');
        }
    };

    return (
        <div>
            <div className='flex justify-center items-center h-screen w-full px-2'>
                <div className='w-full max-w-[600px] h-[400px] bg-[#fff] BgBackground rounded-3xl px-2 py-10 flex flex-col justify-center items-center'>
                    <div className='text-center font-bold text-3xl text-[#fff] mb-10'>Login</div>
                    <div className='w-full flex flex-col justify-center items-center gap-5 mb-10'>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='outline-none border-none rounded-md py-2 px-2 w-full'
                            placeholder='User Name'
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='outline-none border-none rounded-md py-2 px-2 w-full'
                            placeholder='Password'
                            required
                        />
                    </div>
                    <div className='flex justify-center gap-5'>
                       
                        <button
                            className='px-8 py-2 rounded-md bg-[#fff] font-semibold text-[#54a405]'
                            onClick={handleLogin}
                        >
                            Login
                        </button>
                    </div>
                    {error && <p className='text-red-500 mt-4'>{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default Login;
