import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword } from './Firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './Firebase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            
            const userDocRef = doc(db, 'AdminUser', user.uid);  
            const userDocSnap = await getDoc(userDocRef);
            if (user.uid === '43QZgDQCY2OjJehFPyoldb8LnHo1') {
                navigate('/Superadmin');
            }
            else{
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();

                
                if (userData.status === 'inactive') {
                    
                    navigate('/PageNotFound');
                } else {
                    
                    navigate('/Home');
                }
            } else {
                
                console.error("No user data found for this UID");
                setError('User data not found. Please contact support.');
            }
        }
        } catch (error) {
            console.error("Login Error:", error.message);
            setError('Invalid email or password');
        }
    
    };

    return (
        <div className="relative z-[998] min-h-screen bg-grey-900 flex items-center justify-center">
            <div className="w-full max-w-[400px] bg-white shadow-md rounded-lg p-6 border-2">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

                <div className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-300 outline-none"
                        placeholder="Email Address"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-300 outline-none"
                        placeholder="Password"
                        required
                    />
                </div>
                
                {error && (
                    <div className="text-red-500 text-center mb-4">
                        {error}
                    </div>
                )}
                
                <div className="mt-6">
                    <button
                        onClick={handleLogin}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
