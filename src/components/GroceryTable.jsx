import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase, db } from './Firebase';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const GroceryTable = () => {
    const [items, setItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUserId(user ? user.uid : null);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return;

        const itemsRef = ref(rtDatabase, 'items');
        const unsubscribe = onValue(itemsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const itemsList = Object.values(data)
                    .filter((item) => item.displayPreferences?.showInItemList && item.userId === userId)
                    .map((item) => ({
                        name: item.name,
                        price: item.price,
                    }));
                setItems(itemsList);
            } else {
                setItems([]);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    const paginatedItems = chunkArray(items, 14);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % paginatedItems.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [paginatedItems]);

    const visibleItems = paginatedItems[currentIndex] || [];
    const [priceListBgColor, setPriceListBgColor] = useState("#fff");

    useEffect(() => {
        if (!userId) return;

        const fetchUserSettings = async () => {
            const userDocRef = doc(db,`userSettings/${userId}`);
            try {
                const snapshot = await getDoc(userDocRef);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setPriceListBgColor(data.priceListBackgroundColor || "#fff");
                }
            } catch (error) {
                console.error("Error fetching user settings:", error);
            }
        };

        fetchUserSettings();
    }, [userId]);

    return (
        <div style={{ backgroundColor: priceListBgColor }} className="relative ">
           <style>
  {`
    @keyframes scrollText {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    .marquee-container {
      position: relative;
      overflow: hidden;
      width: 100%;
      min-height: 3rem;
    }
    .scrolling-text {
      position: absolute;
      white-space: nowrap;
      will-change: transform;
      animation: scrollText 18s linear infinite;
      width: max-content;
    }
  `}
</style>


            <div className="text-3xl text-center mb-3 font-bold text-[#000]">
                Price List
            </div>

            <div className="w-full overflow-x-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
                    {visibleItems.map((item, index) => (
                        <div
                            key={index}
                            className={`
                                w-full 
                                ${Math.floor(index/2) % 2 === 0 ? "bg-[#fcfefb]" : "bg-[#c2c2c2bd]"}
                                px-8 
                                py-2
                                font-bold 
                                lg:font-medium 
                                2xl:text-[20px]
                                4xl:text-[38px]
                            `}
                        >
                            <div className="marquee-container h-auto">
                                {item.name.length > 22 ? (
                                    <div className="scrolling-text">
                                        {item.name} -{" "}
                                        <span className="text-[#000000] font-bold">{item.price}</span>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        {item.name} -{" "}
                                        <span className="text-[#000000] font-bold">{item.price}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroceryTable;