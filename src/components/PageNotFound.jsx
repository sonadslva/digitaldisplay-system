import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
    return (
        <div className="h-screen w-full flex justify-center items-center bg-gray-100">
            <div className="text-center p-10 bg-white rounded-xl shadow-lg">
                <h1 className="text-6xl font-bold text-red-500">404</h1>
                <h2 className="text-xl mt-4 text-gray-700">Your Validity Has Expired</h2>
                <h2 className="text-2xl mt-4 text-gray-700">Page Not Found</h2>
                <p className="text-lg mt-2 text-gray-500">Sorry, the page you're looking for does not exist.</p>
                <Link to="/" className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold">
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default PageNotFound;
