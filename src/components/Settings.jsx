import React, { useState, useEffect } from 'react';

import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import defaultLogo from "../assets/logo.png";
import { db, auth } from "./Firebase";

const Settings = () => {
    // State for color settings
    const [headerColor, setHeaderColor] = useState("#ffffff");
    const [singleScrollColor, setSingleScrollColor] = useState("#ffffff");
    const [productScrollColor, setProductScrollColor] = useState("#f0f0f0");
    const [fontColor, setFontColor] = useState("#000000");
    const [logoPreview, setLogoPreview] = useState(null);

    // Get current user ID
    const userId = auth.currentUser?.uid;

    // Load existing settings on component mount
    useEffect(() => {
        if (!userId) return;

        const fetchSettings = async () => {
            const userDocRef = doc(db, `userSettings/${userId}`);
            try {
                const snapshot = await getDoc(userDocRef);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setHeaderColor(data.headerColor || "#ffffff");
                    setSingleScrollColor(data.singleScrollColor || "#ffffff");
                    setProductScrollColor(data.productScrollColor || "#f0f0f0");
                    setFontColor(data.fontColor || "#000000");
                    setLogoPreview(data.logoBase64 || null);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Error loading settings.");
            }
        };

        fetchSettings();
    }, [userId]);

    // Save color settings to Firestore
    const saveColorSetting = async (field, value, setState) => {
        try {
            const userDocRef = doc(db, `userSettings/${userId}`);
            await setDoc(userDocRef, { [field]: value }, { merge: true });
            setState(value);
            toast.success(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated!`);
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            toast.error(`Error updating ${field}.`);
        }
    };

    // Color change handlers
    const handleHeaderColorChange = (e) => saveColorSetting("headerColor", e.target.value, setHeaderColor);
    const handleSingleScrollColorChange = (e) => saveColorSetting("singleScrollColor", e.target.value, setSingleScrollColor);
    const handleProductScrollColorChange = (e) => saveColorSetting("productScrollColor", e.target.value, setProductScrollColor);
    const handleFontColorChange = (e) => saveColorSetting("fontColor", e.target.value, setFontColor);

    // Logo upload handler
    const handleLogoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Logo = reader.result; // Convert to Base64
            try {
                const userDocRef = doc(db, `userSettings/${userId}`);
                await setDoc(userDocRef, { logoBase64: base64Logo }, { merge: true });
                setLogoPreview(base64Logo);
                toast.success("Logo uploaded successfully!");
            } catch (error) {
                console.error("Error uploading logo:", error);
                toast.error("Error uploading logo.");
            }
        };
        reader.readAsDataURL(file); // Read the file as a base64 string
    };

    // Remove logo handler
    const handleRemoveLogo = async () => {
        try {
            const userDocRef = doc(db, `userSettings/${userId}`);
            await setDoc(userDocRef, { logoBase64: null }, { merge: true });
            setLogoPreview(null);
            toast.success("Logo removed successfully!");
        } catch (error) {
            console.error("Error removing logo:", error);
            toast.error("Error removing logo.");
        }
    };

    return (
        <div className=' w-full pt-4 bg-gradient-to-r from-[#aeff00] to-[#1e9546] flex justify-center items-center overflow-auto'>
            <div className='overflow-auto w-full mx-auto max-w-[700px] bg-white rounded-3xl shadow-xl'>
                {/* Navigation */}
                <div className='flex justify-between items-center mb-4 pl-10 pt-10'>
                        <Link to="/admin">
                            <button className="text-[#000] bg-[#ffffff] px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition">
                                Back to Admin
                            </button>
                        </Link>
                    </div>
                <div className='w-full flex flex-col  gap-2 py-5 items-center justify-center'>
                    {/* Logo Upload Section */}
                    <div className='mb-6'>
                        <h2 className='text-3xl font-semibold mb-4 text-center'>Logo</h2>
                        <div className='flex items-center space-x-4'>
                            <div className='w-24 h-24 border rounded-lg overflow-hidden'>
                                <img 
                                    src={logoPreview || defaultLogo} 
                                    alt="Logo Preview" 
                                    className='w-full h-full object-contain'
                                />
                            </div>
                            <div className='flex flex-col space-y-2'>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className='w-full text-sm' 
                                />
                                {logoPreview && (
                                    <button 
                                        onClick={handleRemoveLogo}
                                        className='text-red-500 text-sm hover:underline'
                                    >
                                        Remove Logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        {/* Color Settings Section */}
                    <h2 className='text-3xl font-semibold mb-5 text-center'>Color Customization</h2>
                    <div className='grid grid-cols-2 gap-10'>
                        {/* Header Color */}
                        <div>
                            <label className='block font-medium mb-2'>Header Background Color</label>
                            <input 
                                type="color" 
                                value={headerColor} 
                                onChange={handleHeaderColorChange}
                                className='w-16 h-10 cursor-pointer' 
                            />
                        </div>

                        {/* Single Scroll Background Color */}
                        <div>
                            <label className='block font-medium mb-2'>Single Scroll Background Color</label>
                            <input 
                                type="color" 
                                value={singleScrollColor} 
                                onChange={handleSingleScrollColorChange}
                                className='w-16 h-10 cursor-pointer' 
                            />
                        </div>

                        {/* Product Scroll Background Color */}
                        <div>
                            <label className='block font-medium mb-2'>Product Scroll Background Color</label>
                            <input 
                                type="color" 
                                value={productScrollColor} 
                                onChange={handleProductScrollColorChange}
                                className='w-16 h-10 cursor-pointer' 
                            />
                        </div>

                        {/* Font Color */}
                        <div>
                            <label className='block font-medium mb-2'>Font Color</label>
                            <input 
                                type="color" 
                                value={fontColor} 
                                onChange={handleFontColorChange}
                                className='w-16 h-10 cursor-pointer' 
                            />
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
