import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductScroll from './ProductScroll';
import GroceryTable from './GroceryTable';
import SingleProductSlider from './SingleProductSlider';
import { Link } from 'react-router-dom';
import logoPlaceholder from '../assets/logo.png';
import { auth, db } from './Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FaUserAltSlash } from 'react-icons/fa';
import { MdAddBox } from 'react-icons/md';

const Home = () => {
  const navigate = useNavigate();
  const [headerColor, setHeaderColor] = useState(" #175c1b");
  const [singleScrollColor, setSingleScrollColor] = useState(" #5fbf64");
  const [logo, setLogo] = useState(logoPlaceholder);
  const [userId, setUserId] = useState(null);
  const [productScrollColor,setProductScrollColor]=useState(" #5fbf64")
const [priceListBackgroundColor,setPriceListBackgroundColor]=useState(" #d2ecd3")
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  useEffect(() => {
    const fetchUserSettings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userId = user.uid;
      setUserId(userId);

      try {
        const userDocRef = doc(db, `userSettings/${userId}`);
        const snapshot = await getDoc(userDocRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setHeaderColor(data.headerColor || " #175c1b");
          setLogo(data.logoBase64 || logoPlaceholder);
          setSingleScrollColor(data.singleScrollColor || " #5fbf64");
          setProductScrollColor(data.productScrollColor || " #5fbf64");
          setPriceListBackgroundColor(data.priceListBackgroundColor||" #5fbf64");
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    };

    fetchUserSettings();
  }, []);

  return (
    <div className="h-screen w-full overflow-auto lg:overflow-hidden">
      {/* Logo Section */}
      <section style={{ backgroundColor: headerColor }} className="w-full py-1  top-0 left-0 z-[998]">
        <nav className="px-4 flex justify-between items-center">
          <div className="w-[100px] md:w-[100px] h-auto">
            <img src={logo} className="w-full h-full object-contain drop-shadow-md" alt="Logo" />
          </div>
          <div className="flex justify-evenly space-x-4">
            <Link to="/admin">
              <div className="lg:font-bold font-medium lg:text-2xl text-[#000] bg-[#fff] p-2 rounded-full">
                <MdAddBox />
              </div>
            </Link>
            <button className="lg:font-bold font-medium lg:text-2xl text-[#000] bg-[#fff] p-2 rounded-full" onClick={handleLogout}>
              <FaUserAltSlash />
            </button>
          </div>
        </nav>
      </section>

      {/* Main Content Section */}
      <div className=" lg:h-[calc(75vh-60px)] flex flex-col lg:flex-row justify-between items-start mb-5 border-b-2 -z-10 overflow-auto">
        {/* Single Product Slider */}
        <section className="flex justify-center items-center w-full lg:w-[50%] pt-14 lg:pt-0 h-[50%] 2xl:mt-[-30px] lg:h-full mb-4 lg:mb-0">
          <div style={{ backgroundColor: singleScrollColor }} className="w-full flex justify-center items-center h-full">
            <SingleProductSlider />
          </div>
        </section>

        {/* Grocery Table */}
        <section className="hidden lg:flex lg:w-[50%] h-full ">
          <div className="w-full">
            <GroceryTable />
          </div>
        </section>
      </div>

      {/* Product Scroll Section */}
      <section style={{ backgroundColor :productScrollColor}} className="h-auto w-full  px-5 overflow-hidden relative z-50 lg:mb-10 md:fixed md:bottom-[-10px]">
        <div  className="w-full h-full">
          <ProductScroll />
        </div>
      </section>

      {/* Mobile View: Grocery Table */}
      <section style={{ backgroundColor: priceListBackgroundColor }} className="lg:hidden mb-5">
        <div className="w-full">
          <GroceryTable />
        </div>
      </section>
    </div>
  );
};

export default Home;
