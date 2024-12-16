import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { addDoc, collection } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './Firebase';
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';

const Adduser = () => {
    const [newUser, setNewUser] = useState({
        customerName: '',
        shopName: '',
        phoneNumber: '',
        amount: '',
        location: '',
        email: '',
        password: '',
        status: 'active',
    });
    const navigate = useNavigate();

    const handleAddUser = async () => {
        try {
            if (!newUser.customerName || !newUser.shopName ||  
                !newUser.phoneNumber || !newUser.amount || !newUser.location ||
                !newUser.email || !newUser.password) {
                alert('Please fill in all fields');
                return;
            }

            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
            const user = userCredential.user;

            // Generate unique admin ID
            const adminId = `ADMIN-${uuidv4()}`;
          
            // Calculate validity (1 year from now)
            const currentDate = new Date();
            const validityDate = new Date(currentDate);
            validityDate.setFullYear(currentDate.getFullYear() + 1);
    
            const userToAdd = {
                ...newUser,
                adminId,
                userId: user.uid, // Firebase Authentication UID
                numberOfDays: 0,  // Initialize numberOfDays to 0
                validity: validityDate,
                createdAt: Timestamp.now(), // Use Firestore Timestamp
            };
    
            await addDoc(collection(db, 'AdminUser'), userToAdd);

            navigate('/Superadmin');
        } catch (error) {
            console.error("Error adding user:", error);
            alert('Error adding user. Please try again.');
        }
    };

    return (
        <div className='h-screen w-full pt-4 fixed z-[999] bg-gradient-to-r from-[#aeff00] to-[#1e9546] flex justify-center items-center'>
            <div className='h-auto max-w-[700px] bg-[#232323] w-full rounded-3xl'>
                <div className='w-full flex flex-col gap-5 py-10 px-4'>
                    <div className='mb-3 font-bold text-[#fff] text-3xl text-center'>Add User</div>
                    
                    <input
                        type="text"
                        placeholder='Customer Name'
                        value={newUser.customerName}
                        onChange={(e) => setNewUser({...newUser, customerName: e.target.value})}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                        required
                    />
                    
                    <input
                        type="text"
                        placeholder='Shop Name'
                        value={newUser.shopName}
                        onChange={(e) => setNewUser({...newUser, shopName: e.target.value})}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                        required
                    />
                    
                    <input
                        type="tel"
                        placeholder='Phone Number'
                        value={newUser.phoneNumber}
                        onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                        required
                    />
                    
                    <input
                        type="number"
                        placeholder='Amount'
                        value={newUser.amount}
                        onChange={(e) => setNewUser({...newUser, amount: e.target.value})}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                        required
                    />
                    
                    <input
                        type="text"
                        placeholder='Location'
                        value={newUser.location}
                        onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                        required
                    />

                    <input
                        type="email"
                        placeholder='Email'
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                        required
                    />

                    <input
                        type="password"
                        placeholder='Password'
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                        required
                    />

                    <div className='flex justify-center items-center gap-5 mt-4'>
                        <Link to="/superadmin">
                            <button className='px-8 py-2 bg-[#fff] rounded-lg font-semibold'>Cancel</button>
                        </Link>
                        <button
                            onClick={handleAddUser}
                            className='px-8 py-2 bg-[#fff] rounded-lg font-semibold'
                        >
                            Add User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Adduser;