import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase ,db} from './Firebase';
import { HiCurrencyRupee } from "react-icons/hi2";
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
const ProductScroll = () => {
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const sliderRef = useRef(null);
  const [animationDuration, setAnimationDuration] = useState([])

  useEffect(() => {
    // Get user ID after authentication
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUserId(user ? user.uid : null); // Set userId based on auth state
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return; // Skip fetching if no user is authenticated

    const itemsRef = ref(rtDatabase, 'items');
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList = Object.values(data)
          .filter(item => item.displayPreferences?.showInListScroll && item.userId === userId) // Filter by userId
          .map(item => ({
            img: item.image,
            price: item.price,
            name: item.name
          }));
        setProducts(productsList);

        const totalWidth = productsList.length * 200;
        const duration = totalWidth / 80;
        setAnimationDuration(duration);
      }
    });

    return () => unsubscribe();
  }, [userId]); 

  
  const doubledProducts = [...products, ...products];

 
  const [fontColor, setFontColor] = useState("white");
  const [priceBgColor, setPriceBgColor] = useState("  #277d2b");
  useEffect(() => {
      if (!userId) return;

      const fetchUserSettings = async () => {
          const userDocRef = doc(db, `userSettings/${userId}`);
          try {
              const snapshot = await getDoc(userDocRef);
              if (snapshot.exists()) {
                  const data = snapshot.data();
                  setFontColor(data.fontColor || "black");
                  setPriceBgColor(data.priceBackgroundColor || " #277d2b");
              }
          } catch (error) {
              console.error("Error fetching user settings:", error);
          }
      };

      fetchUserSettings();
  }, [userId]);

  return (
    <div  className="product-scroller overflow-hidden relative">
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
      <div
        className="product-slider flex transition-transform duration-[15s] ease-linear"
        ref={sliderRef}
        style={{
          width: `${products.length * 200}px`,
          animationDuration: `${animationDuration}s`,
        }}
      >
        {doubledProducts.map((product, index) => (
          <div key={index} className="product-card relative overflow-hidden flex-shrink-0">
            <div className="product-image">
              <img
                src={product.img}
                className="object-contain w-full h-full"
                alt={product.name}
              />
            </div>
            <div className="marquee-container   h-auto ">
              {product.name.length > 22 ? (
                <div className="absolute   left-1/2 scrolling-text font-bold text-lg text-black">{product.name} </div>
              ) : (
                <div className="absolute  transform -translate-x-1/2  left-1/2 text-center font-bold text-lg text-black ">{product.name} </div>
              )}
            </div>
            <div style={{ backgroundColor: priceBgColor,color:fontColor }} className=" flex w-full justify-center items-center bg-[#1d485f] absolute bottom-0 gap-1 text-xl lg:text-[45px] py-3 font-semibold text-[#fff]">
              <HiCurrencyRupee />
              {product.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductScroll;
