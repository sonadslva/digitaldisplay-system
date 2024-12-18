import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import defaultLogo from "../assets/logo.png";
import { db, auth } from "./Firebase";

const Settings = () => {
    const [headerColor, setHeaderColor] = useState("rgb(23, 92, 27)");
    const [singleScrollColor, setSingleScrollColor] = useState("rgb(33, 129, 38)");
    const [productScrollColor, setProductScrollColor] = useState("rgb(95, 191, 100)");
    const [fontColor, setFontColor] = useState("rgb(255, 255, 255)");
    const [priceBackgroundColor, setPriceBackgroundColor] = useState("rgb(39, 125, 43)");
    const [logoPreview, setLogoPreview] = useState(null);

    const userId = auth.currentUser?.uid;

    useEffect(() => {
        if (!userId) return;

        const fetchSettings = async () => {
            const userDocRef = doc(db, `userSettings/${userId}`);
            try {
                const snapshot = await getDoc(userDocRef);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setHeaderColor(data.headerColor || "rgb(23, 92, 27)");
                    setSingleScrollColor(data.singleScrollColor || "rgb(33, 129, 38)");
                    setProductScrollColor(data.productScrollColor || "rgb(95, 191, 100)");
                    setFontColor(data.fontColor || "  #ffffff");
                    setPriceBackgroundColor(data.priceBackgroundColor || "rgb(39, 125, 43)");
                    setLogoPreview(data.logoBase64 || null);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Error loading settings.");
            }
        };

        fetchSettings();
    }, [userId]);

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

    const handleHeaderColorChange = (e) => saveColorSetting("headerColor", e.target.value, setHeaderColor);
    const handleSingleScrollColorChange = (e) => saveColorSetting("singleScrollColor", e.target.value, setSingleScrollColor);
    const handleProductScrollColorChange = (e) => saveColorSetting("productScrollColor", e.target.value, setProductScrollColor);
    const handleFontColorChange = (e) => saveColorSetting("fontColor", e.target.value, setFontColor);
    const handlePriceBackroundColorChange = (e) => saveColorSetting("priceBackgroundColor", e.target.value, setPriceBackgroundColor);

    const handleLogoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Logo = reader.result;
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
        reader.readAsDataURL(file);
    };

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
        <div className="bg-white relative min-h-screen flex justify-center items-center p-4 " >
            <div className="bg-grey-700 shadow-xl rounded-lg p-8 w-full max-w-4xl flex flex-col border-2 ">
                {/* Navigation */}
                <div className=" absolute top-5 left-5 flex justify-between items-center mb-6">
                    <Link to="/admin">
                        <button className="text-black bg-gray-200 px-4 py-2 rounded-md font-semibold shadow hover:bg-gray-300 transition">Back to Admin</button>
                    </Link>
                </div>

                <div className="space-y-10">
                    {/* Logo Upload Section */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Logo</h2>
                        <div className="flex justify-center items-center space-x-6">
                            <div className="w-32 h-32 border rounded-lg overflow-hidden">
                                <img src={logoPreview || defaultLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="block w-full text-sm" 
                                />
                                {logoPreview && (
                                    <button 
                                        onClick={handleRemoveLogo}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        Remove Logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Color Settings Section */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-center">Color Customization</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Header Color */}
                            <div>
                                <label className="block font-medium mb-2">Header Background Color</label>
                                <input 
                                    type="color" 
                                    value={headerColor} 
                                    onChange={handleHeaderColorChange}
                                    className="w-16 h-10 cursor-pointer border rounded-md" 
                                />
                            </div>

                            {/* Single Scroll Background Color */}
                            <div>
                                <label className="block font-medium mb-2">Single Scroll Background Color</label>
                                <input 
                                    type="color" 
                                    value={singleScrollColor} 
                                    onChange={handleSingleScrollColorChange}
                                    className="w-16 h-10 cursor-pointer border rounded-md" 
                                />
                            </div>

                            {/* Product Scroll Background Color */}
                            <div>
                                <label className="block font-medium mb-2">Product Scroll Background Color</label>
                                <input 
                                    type="color" 
                                    value={productScrollColor} 
                                    onChange={handleProductScrollColorChange}
                                    className="w-16 h-10 cursor-pointer border rounded-md" 
                                />
                            </div>

                            {/* Font Color */}
                            <div>
                                <label className="block font-medium mb-2">Font Color</label>
                                <input 
                                    type="color" 
                                    value={fontColor} 
                                    onChange={handleFontColorChange}
                                    className="w-16 h-10 cursor-pointer border rounded-md" 
                                />
                            </div>

                            {/* Price Background Color */}
                            <div>
                                <label className="block font-medium mb-2">Price Background Color</label>
                                <input 
                                    type="color" 
                                    value={priceBackgroundColor} 
                                    onChange={handlePriceBackroundColorChange}
                                    className="w-16 h-10 cursor-pointer border rounded-md" 
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
