import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase } from './Firebase';
import { HiCurrencyRupee } from "react-icons/hi2";

const ProductScroll = () => {
  const [products, setProducts] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    const itemsRef = ref(rtDatabase, 'items');
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList = Object.values(data)
          .filter(item => item.displayPreferences?.showInListScroll)
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

  // Double the products array for seamless scrolling
  const doubledProducts = [...products, ...products];

  return (
    <div className="product-scroller">
      <div
        className="product-slider"
        ref={sliderRef}
        style={{
          width: `${products.length * 200}px`, // Set the width dynamically
        }}
      >
        {doubledProducts.map((product, index) => (
          <div key={index} className="product-card relative overflow-hidden">
            <div className="product-image">
              <img
                src={product.img}
                className="object-contain"
                alt={product.name}
              />
            </div>
            <div className="product-name">{product.name}</div>
            <div className="product-price flex w-full justify-center items-center bg-[#1d485f] absolute bottom-0 gap-1 text-xl lg:text-[45px] font-semibold text-[#fff]">
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
