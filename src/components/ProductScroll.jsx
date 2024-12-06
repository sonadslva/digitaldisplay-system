import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase } from './Firebase';
import { HiCurrencyRupee } from "react-icons/hi2";

// Import images
import tomato from "../assets/tomato.png";
import onion from "../assets/onion.png";
import potato from "../assets/potato.png";
import pumkin from "../assets/pumkin.png";
import watermelon from "../assets/watermelon.png";
import strawberry from "../assets/strawberry.png";

const ProductScroll = () => {

  const [products, setProducts] = useState([]);
  // Array of products
  // const products = [
  //   { img: tomato, price: 20, name: "തക്കാളി" },
  //   { img: onion, price: 28, name: "വലിയ ഉള്ളി" },
  //   { img: potato, price: 25, name: "ഉരുളക്കിഴങ്ങ്" },
  //   { img: pumkin, price: 27, name: "മത്തൻ" },
  //   { img: watermelon, price: 52, name: "തണ്ണീർ മത്തൻ" },
  //   { img: strawberry, price: 52, name: "സ്ട്രൗബെറി" },
  // ];

  useEffect(() => {
    const itemsRef = ref(rtDatabase, 'items');
    const unsubscribe = onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const productsList = Object.values(data)
                .filter(item => item.displayPreferences.showInListScroll)
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
  const doubledProducts = [...products, ...products, ...products];

  return (
    <div className="product-scroller">
      <div className="product-slider">
        {doubledProducts.map((product, index) => (
          <div key={index} className="product-card relative overflow-hidden">
            {/* <div className="product-name">{product.name}</div> */}
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
