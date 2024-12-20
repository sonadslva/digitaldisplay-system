import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase } from './Firebase';
import { FaRupeeSign } from "react-icons/fa";
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { db } from "./Firebase";
const SingleProductSlider = () => {
    const [products, setProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef(null);
    const [userId, setUserId] = useState(null);
    const [fontColor, setFontColor] = useState("white");
    const [priceBgColor, setPriceBgColor] = useState("rgb(39, 125, 43)");
    useEffect(() => {
        if (!userId) return;

        const fetchUserSettings = async () => {
            const userDocRef = doc(db, `userSettings/${userId}`);
            try {
                const snapshot = await getDoc(userDocRef);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setFontColor(data.fontColor || "black");
                    setPriceBgColor(data.priceBackgroundColor || "white");
                }
            } catch (error) {
                console.error("Error fetching user settings:", error);
            }
        };

        fetchUserSettings();
    }, [userId]);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUserId(user ? user.uid : null);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return; // Skip fetching data if userId is null

        const itemsRef = ref(rtDatabase, 'items');
        const unsubscribe = onValue(itemsRef, (snapshot) => {
            const data = snapshot.val();
            console.log('Fetched Data:', data); // Log the fetched data to inspect it

            if (data) {
                const productsList = Object.values(data)
                    .filter(item => item.displayPreferences?.showInSingleScroll && item.userId === userId)
                    .map(item => ({
                        img: item.image || 'path-to-fallback-image.jpg', // Fallback if no image
                        price: item.price,
                        name: item.name,
                        nativeName: item.nativeName || ''
                    }));
                setProducts(productsList);
            } else {
                setProducts([]);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        if (products.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [products]);

    useEffect(() => {
        if (scrollContainerRef.current && products.length > 0) {
            scrollContainerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    }, [currentIndex, products]);

    if (products.length === 0) {
        return <div>No products available for this user</div>;
    }

    return (
        <div className="w-full h-full" >
            <div className="w-full flex justify-center items-center h-full">
                <div className="w-[90%] bg-[#fefefe] h-[300px] rounded-3xl lg:h-full BoxShadow py-3 overflow-hidden relative">
                    <div ref={scrollContainerRef} className="flex w-full h-full transition-transform duration-700">
                        {products.map((product, index) => (
                            <div key={index} className="w-full h-full flex-shrink-0 flex flex-col justify-between overflow-hidden">
                                <div className="flex flex-col items-center justify-center h-full">
                                    {/* Image Section */}
                                    <div className="w-[73%] h-[53%] flex justify-center items-center mb-4">
                                        <img src={product.img} className="w-full h-full object-contain" alt={product.name} />
                                    </div>

                                    {/* Product Name Section */}
                                    <div className="text-center font-extrabold flex flex-col text-xl lg:text-[32px] text-[#201e1e] mb-4 PriceName">
                                        {product.name}
                                        <p className='text-[25px] mt-2'>{product.nativeName}</p>
                                    </div>

                                    {/* Price Section */}
                                    <div  style={{ backgroundColor: priceBgColor,color:fontColor }} className="w-full h-[70px] text-center flex justify-center items-center bg-[#68b244] rounded-3xl text-[#fff] lg:text-[60px] text-3xl PriceFontIcon lg:py-4 ">
                                        <FaRupeeSign />
                                        <span  className="ml-1 lg:text-[60px] font-bold PriceFont">{product.price}.0</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleProductSlider;
