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
    const [priceBgColor, setPriceBgColor] = useState("#277d2b");
    useEffect(() => {
        if (!userId) return;

        const fetchUserSettings = async () => {
            const userDocRef = doc(db, `userSettings/${userId}`);
            try {
                const snapshot = await getDoc(userDocRef);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setFontColor(data.fontColor || "#ffffff");
                    setPriceBgColor(data.priceBackgroundColor || "#277d2b");
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
        <div className="w-full h-full">
        <div className="w-full flex justify-center items-center h-full">
          <div className="w-[90%] bg-[#fefefe] h-[300px] 2xl:h-[500px] 3xl:h-[600px] 4xl:h-[700px] rounded-3xl lg:h-full BoxShadow py-3 overflow-hidden relative">
            <div ref={scrollContainerRef} className="flex w-full h-full transition-transform duration-700">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="w-full h-full flex-shrink-0 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="flex flex-col items-center h-full px-4">
                    {/* Image Section */}
                    <div className="w-[50%] h-[50%] flex justify-center items-center mt-2 lg:mt-4 ">
                      <img
                        src={product.img}
                        className="w-full h-full object-cover"
                        alt={product.name}
                      />
                    </div>
      
                    {/* Name Section */}
                    <div className="w-full mt-4 lg:mt-6 text-center">
                      <span className="block font-extrabold text-3xl lg:text-4xl 2xl:text-5xl text-[#201e1e]">
                        {product.name}
                      </span>
                      <span className="block font-bold text-lg lg:text-2xl 2xl:text-3xl text-gray-600 mt-1">
                        {product.nativeName}
                      </span>
                    </div>
      
                    {/* Price Section */}
                    <div
                      style={{
                        backgroundColor: priceBgColor,
                        color: fontColor,
                      }}
                      className="w-full absolute bottom-0 h-[70px] lg:h-[80px] text-center flex justify-center items-center rounded-3xl text-[#fff] text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold"
                    >
                      <FaRupeeSign />
                      <span className="ml-1">{product.price}.0</span>
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
