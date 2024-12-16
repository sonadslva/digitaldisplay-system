import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase } from './Firebase';
import { getAuth } from 'firebase/auth';

const GroceryTable = () => {
    const [items, setItems] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userId, setUserId] = useState(null);

    // Get user ID after authentication
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(user => {
            setUserId(user ? user.uid : null); // Set userId based on auth state
        });
        return () => unsubscribe();
    }, []);

    // Fetch data from Firebase when userId is available
    useEffect(() => {
        if (!userId) return; // Skip fetching if no user is authenticated

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
    }, [userId]); // Re-run when userId changes

    // Paginate items into chunks of 18
    const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    const paginatedItems = chunkArray(items, 18);

    // Update the visible items every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % paginatedItems.length);
        }, 10000); // 10 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, [paginatedItems]);

    // Ensure at least one page of items to display
    const visibleItems = paginatedItems[currentIndex] || [];

    // Function to chunk rows into groups of 2 items for display
    const chunkRows = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    const rows = chunkRows(visibleItems, 2);

    return (
        <div className="bg-[#a4d38f]">
            <div className="text-3xl text-center mb-3 font-bold text-[#fff]">Price List</div>

            <div className="w-full overflow-x-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-5">
                    {rows.map((row, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                            {/* First item in each row */}
                            <div
                                className={`w-full text-center ${rowIndex % 2 === 0 ? 'bg-[#ddffd1]' : 'bg-[#c2c2c2bd]'} px-8 py-2 font-bold lg:font-medium 2xl:text-[38px]`}
                            >
                                {row[0]?.name} -{' '}
                                <span className="text-[#000000] font-bold">{row[0]?.price}</span>
                            </div>

                            {/* Second item in each row */}
                            {row[1] && (
                                <div
                                    className={`w-full text-center ${rowIndex % 2 === 0 ? 'bg-[#ddffd1]' : 'bg-[#c2c2c2bd]'} px-8 py-2 font-bold 2xl:text-[38px] lg:font-medium`}
                                >
                                    {row[1]?.name} -{' '}
                                    <span className="text-[#000000] font-bold">{row[1]?.price}</span>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GroceryTable;
