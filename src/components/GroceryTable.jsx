import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase } from './Firebase';

const GroceryTable = () => {

    const [items, setItems] = useState([]);

    useEffect(() => {
        const itemsRef = ref(rtDatabase, 'items');
        const unsubscribe = onValue(itemsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const itemsList = Object.values(data)
                    .filter(item => item.displayPreferences.showInItemList)
                    .map(item => ({
                        name: item.name,
                        price: item.price
                    }));
                setItems(itemsList);
            }
        });

        return () => unsubscribe();
    }, []);

    const groceryList = [
        { name: 'തക്കാളി', price: 20 },
        { name: 'വലിയ ഉള്ളി', price: 30 },
        { name: 'ഉരുളക്കിഴങ്ങ്', price: 28 },
        { name: 'വെണ്ടയ്ക്ക', price: 16 },
        { name: 'മത്തൻ', price: 36 },
        { name: 'പടവലം', price: 22 },
        { name: 'പയർ', price: 18 },
        { name: 'കിഴങ്ങ്', price: 35 },
        { name: 'വെണ്ടയ്ക്ക', price: 16 },
        { name: 'വെണ്ടയ്ക്ക', price: 16 },
        { name: 'മത്തൻ', price: 36 },
        { name: 'പടവലം', price: 22 },
        { name: 'പയർ', price: 18 },
        { name: 'കിഴങ്ങ്', price: 35 },
        { name: 'വെണ്ടയ്ക്ക', price: 16 },
        { name: 'തക്കാളി', price: 20 },
        { name: 'വലിയ ഉള്ളി', price: 30 },
        { name: 'ഉരുളക്കിഴങ്ങ്', price: 28 },
        { name: 'വെണ്ടയ്ക്ക', price: 16 },
        { name: 'മത്തൻ', price: 36 },
        { name: 'പടവലം', price: 22 },
        { name: 'പയർ', price: 18 },
        { name: 'കിഴങ്ങ്', price: 35 },
        { name: 'വെണ്ടയ്ക്ക', price: 16 },
        { name: 'വെണ്ടയ്ക്ക', price: 16 },
        { name: 'മത്തൻ', price: 36 },
        { name: 'പടവലം', price: 22 },
        { name: 'പയർ', price: 18 },
        { name: 'കിഴങ്ങ്', price: 35 },
        { name: 'വെണ്ടയ്ക്ക', price: 16 },
    ];

    // Function to split the grocery list into rows of 3 items
    const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    const rows = chunkArray(items, 2);

    return (
        <div className="bg-[#a4d38f]">
            <div className="text-3xl text-center mb-3 font-bold text-[#fff]">Price List</div>

            <div className="w-full overflow-x-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
                    {rows.map((row, rowIndex) => (
                        <>
                            {/* First item in each row */}
                            <div key={rowIndex} className={`w-full text-center ${rowIndex % 2 === 0 ? 'bg-[#ddffd1]' : 'bg-[#c2c2c2bd]'} px-8 py-2 font-medium`}>
                                {row[0].name} - <span className='text-[#d35246] font-semibold'>{row[0].price}</span>
                            </div>

                            {/* Second item in each row */}
                            <div key={rowIndex + '-second'} className={`w-full text-center ${rowIndex % 2 === 0 ? 'bg-[#ddffd1]' : 'bg-[#c2c2c2bd]'} px-8 py-2`}>
                                {row[1]?.name} - <span className='text-[#d35246] font-semibold'>{row[1]?.price}</span>
                            </div>

                            {/* Third item in each row */}
                            {/* <div key={rowIndex + '-third'} className={`w-full text-center ${rowIndex % 2 === 0 ? 'bg-[#ddffd1]' : 'bg-[#c2c2c2bd]'} px-8 py-2`}>
                                {row[2]?.name} - <span className='text-[#d35246] font-semibold'>{row[2]?.price}</span>
                            </div> */}
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroceryTable;
