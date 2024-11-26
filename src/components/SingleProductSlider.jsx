import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase } from './Firebase';
import { FaRupeeSign } from "react-icons/fa";

const SingleProductSlider = () => {
    const [products, setProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef(null);

    const singleProductList = [
        { name: "തക്കാളി", price: 20.0, img: "img" },
        { name: "വലിയ ഉള്ളി", price: 20.0, img: "img" },
        { name: "ഉരുളക്കിഴങ്ങ്", price: 20.0, img: "img" },
        { name: "മത്തൻ", price: 20.0, img: "img" },
    ];

    useEffect(() => {
        const itemsRef = ref(rtDatabase, 'items');
        const unsubscribe = onValue(itemsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const productsList = Object.values(data)
                    .filter(item => item.displayPreferences?.showInSingleScroll)
                    .map(item => ({
                        img: item.image,
                        price: item.price,
                        name: item.name
                    }));
                setProducts(productsList);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (products.length === 0) return; // Skip interval logic if no products

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
        }, 3000); // 3 seconds interval

        return () => clearInterval(interval); // Clear the interval on component unmount
    }, [products]);

    useEffect(() => {
        if (scrollContainerRef.current && products.length > 0) {
            // Scroll to the current index using transform
            scrollContainerRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    }, [currentIndex, products]);

    return (
        <div className="w-full h-full">
            <div className="w-full flex justify-center items-center h-full">
                <div className="w-[90%] bg-[#fefefe] h-[300px] rounded-3xl lg:h-full BoxShadow py-3 overflow-hidden relative">
                    <div
                        ref={scrollContainerRef}
                        className="flex w-full h-full transition-transform duration-700"
                    >
                        {products.map((product, index) => (
                            <div
                                key={index}
                                className="w-full h-full flex-shrink-0 flex flex-col justify-between"
                            >
                                <div className="flex flex-col items-center justify-center h-full">
                                    {/* Image Section */}
                                    <div className="w-[80%] h-[60%] flex justify-center items-center mb-4">
                                        <img
                                            src={product.img}
                                            className="w-full h-full object-contain"
                                            alt={product.name}
                                        />
                                    </div>

                                    {/* Product Name Section */}
                                    <div className="text-center font-extrabold text-[32px] text-[#201e1e] mb-4">
                                        {product.name}
                                    </div>

                                    {/* Price Section at the bottom */}
                                    <div className="w-full text-center flex justify-center items-center bg-[#68b244] rounded-3xl py-3 text-[#fff] text-2xl">
                                        <FaRupeeSign />
                                        <span className="ml-1 text-3xl font-bold">{product.price}.0</span>
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
