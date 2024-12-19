import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { addDoc, collection } from 'firebase/firestore';
import { db, rtDatabase } from './Firebase';
import { push, ref } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const AddItem = () => {
    const [itemName, setItemName] = useState('');
    const [nativeItemName ,setNativeItemName]=useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [base64Image, setBase64Image] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();
    
    // Get the current user from Firebase Auth
    const auth = getAuth();
    const user = auth.currentUser;

    // Handle image change and preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500000) { // 500KB limit
                alert('Image size should be less than 500KB');
                return;
            }

            setIsUploading(true);
            const reader = new FileReader();
            
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setBase64Image(reader.result);
                setIsUploading(false);
            };
    
            reader.onerror = () => {
                alert('Error reading file');
                setIsUploading(false);
            };
    
            reader.readAsDataURL(file);
        }
    };

    const handleAddItem = async () => {
        try {
            if (!itemName || !itemPrice) {
                alert('Please fill in the item name and price');
                return;
            }

            if (!base64Image) {
                alert('Please select an image');
                return;
            }

            if (!user) {
                alert('You must be logged in to add an item');
                return;
            }

            const formattedItemName = itemName.toUpperCase();
            const itemData = {
                name: formattedItemName,
                nativeName: nativeItemName || '',
                price: Number(itemPrice),
                image: base64Image,
                status: 'active',
                createdAt: new Date().toISOString(),
                userId: user.uid,  // Store the user ID (foreign key)
                displayPreferences: {
                    showInItemList: false,
                    showInListScroll: false,
                    showInSingleScroll: false
                }
            };

            // Add to Firestore
            await addDoc(collection(db, 'items'), itemData);

            // Add to Realtime Database
            await push(ref(rtDatabase, 'items'), itemData);

            navigate('/admin');
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Error adding item. Please try again.');
        }
    };

    return (
        <div className='h-screen w-full pt-4 fixed z-[999]  flex justify-center items-center'>
            <div className='h-auto max-w-[700px] bg-[#232323] w-full rounded-3xl'>
                <div className='w-full flex flex-col gap-5 py-10 px-4'>
                    <div className='mb-3 font-bold text-[#fff] text-3xl text-center'>Add Item</div>
                    
                    <input
                        type="text"
                        placeholder='Item Name'
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                    />
                    <input
                        type="text"
                        placeholder='NativeItemName'
                        value={nativeItemName}
                        onChange={(e) => setNativeItemName(e.target.value)}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                    />
                    <input
                        type="number"
                        placeholder='Item Price'
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        className='px-8 py-2 rounded-lg w-full border-none outline-none'
                    />
                    
                    <div className='flex flex-col gap-3'>
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/gif"
                            onChange={handleImageChange}
                            className='hidden'
                            id="imageInput"
                        />

                        <button
                            onClick={() => document.getElementById('imageInput').click()}
                            className='px-8 py-2 bg-[#fff] rounded-lg font-semibold'
                            disabled={isUploading}
                        >
                            {isUploading ? 'Processing Image...' : 'Select Image'}
                        </button>

                        {imagePreview && (
                            <div className='flex justify-center flex-col items-center gap-2'>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className='h-40 w-40 object-cover rounded-lg'
                                />
                                <button
                                    onClick={() => {
                                        setImagePreview('');
                                        setBase64Image('');
                                    }}
                                    className='text-white underline'
                                >
                                    Remove Image
                                </button>
                            </div>
                        )}
                    </div>

                    <div className='flex justify-center items-center gap-5 mt-4'>
                        <Link to="/admin">
                            <button className='px-8 py-2 bg-[#fff] rounded-lg font-semibold'>Cancel</button>
                        </Link>
                        <button
                            onClick={handleAddItem}
                            className='px-8 py-2 bg-[#fff] rounded-lg font-semibold'
                            disabled={isUploading}
                        >
                            Add Item
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddItem
