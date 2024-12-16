import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import ProductScroll from './ProductScroll';
import GroceryTable from './GroceryTable';
import SingleProductSlider from './SingleProductSlider';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png"
import { auth } from './Firebase';

const Home = () => {
  const navigate = useNavigate(); // Use the useNavigate hook for navigation

  const handleLogout = async () => {
    try {
      await auth.signOut();  
      navigate("/login");    
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <div className="h-screen w-full overflow-auto lg:overflow-hidden">
      {/* Logo Section */}
      <section className="w-full py-3 bg-[#000] NavbarBg fixed top-0 left-0 z-[998]">
        <nav className="px-4 flex justify-between items-center">
          <div className="w-[100px] md:w-[130px] h-auto">
            <img src={logo} className="w-full h-full object-contain drop-shadow-md" alt="" />
          </div>
          <div className='flex justify-evenly space-x-4' >
          <Link to="/admin">
            <div className='lg:font-bold font-medium lg:text-2xl text-[#000]'>DATABASE</div>
          </Link>
          <button className="lg:font-bold font-medium lg:text-2xl text-[#000]" onClick={handleLogout}>LOGOUT</button>
          </div>
        </nav>
      </section>

      {/* Main Content Section */}
      <div className="lg:pt-[60px] lg:h-[calc(75vh-60px)] flex flex-col lg:flex-row justify-between items-start TableListBg mb-5 border-b-2 -z-10 overflow-auto">
        {/* Single Product Slider */}
        <section className="flex justify-center items-center w-full lg:w-[50%] pt-14 lg:pt-0 h-[50%] lg:h-full mb-4 lg:mb-0 SingleScrollBackground">
          <div className="w-full flex justify-center items-center h-full py-5">
            <SingleProductSlider />
          </div>
        </section>

        {/* Grocery Table */}
        <section className="hidden lg:flex lg:w-[50%] h-full">
          <div className="w-full">
            <GroceryTable />
          </div>
        </section>
      </div>

      {/* Product Scroll Section */}
      <section className="h-[25vh] px-4 productScroll relative z-50 lg:mb-10">
        <div className="w-full h-full">
          <ProductScroll />
        </div>
      </section>

      {/* Mobile View: Grocery Table */}
      <section className="lg:hidden mb-5">
        <div className="w-full">
          <GroceryTable />
        </div>
      </section>
    </div>
  );
};

export default Home;
