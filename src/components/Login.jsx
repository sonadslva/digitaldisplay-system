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

            
            if (user.uid === '43QZgDQCY2OjJehFPyoldb8LnHo1') {
                navigate('/Superadmin');
            } else {
                navigate('/Home'); 
            }
        } catch (error) {
            setError('Invalid email or password');
          
        }
    };

    return (
        <div className="relative z-[998] min-h-screen bg-grey-900 flex items-center justify-center">
            <div className="w-full max-w-[400px] bg-white shadow-md rounded-lg p-6 border-2">
                {/* Header */}
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>

                {/* Input Fields */}
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
                {/* Login Button */}
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
