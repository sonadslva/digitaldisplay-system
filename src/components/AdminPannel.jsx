import React, { useState, useEffect } from "react";
import { BsFillPlusSquareFill } from "react-icons/bs";
import { LuSearch } from "react-icons/lu";
import { MdModeEditOutline, MdDelete, MdSave, MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";
import { ref, onValue, update, remove, Database, set  } from 'firebase/database';
import { collection, addDoc } from "firebase/firestore";
import { rtDatabase ,db } from './Firebase';
import { auth } from './Firebase';
import { Navigate } from "react-router-dom"
import UploadBackgroundVideo from "./UploadBackgroundVideo";
import { SiGoogledisplayandvideo360 } from "react-icons/si";
import logo from "../assets/logo.png"
import * as XLSX from 'xlsx';
import axios from "axios";
import { push } from "firebase/database";
import {  uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateDoc, doc,setDoc } from 'firebase/firestore';
import Home from "./Home";
import { useNavigate } from 'react-router-dom';
import { FaUserAltSlash } from "react-icons/fa";
import { FaDisplay } from "react-icons/fa6";
import { PiMicrosoftExcelLogoBold } from "react-icons/pi";
import { IoIosAdd } from "react-icons/io";
import { IoMdSettings } from "react-icons/io";
import {  getDoc } from 'firebase/firestore';
import logoPlaceholder from '../assets/logo.png';
import { SiTicktick } from "react-icons/si";
import { RxCross2 } from "react-icons/rx";

const AdminPannel = () => {
  const [items, setItems] = useState([]);
  // const [videos, setVideos] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editedItems, setEditedItems] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [excelData, setExcelData] = useState([]); 
  const [fileName, setFileName] = useState(''); 
  
  const [isUploading1, setIsUploading1] = useState(false);
  const [selectAllItemList, setSelectAllItemList] = useState(false);
  const [selectAllListScroll, setSelectAllListScroll] = useState(false);
  const [selectAllSingleScroll, setSelectAllSingleScroll] = useState(false);
  const [selectAllRows, setSelectAllRows] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  

  useEffect(() => {
    // Ensure that the auth object and currentUser are loaded
    if (auth.currentUser) {
      const itemsRef = ref(rtDatabase, 'items');
      
      // Listen to the real-time database and filter items based on the logged-in user's ID
      const unsubscribe = onValue(itemsRef, (snapshot) => {
        const data = snapshot.val();
        const itemsList = data 
          ? Object.keys(data).map(key => ({
              id: key,
              ...data[key]
            }))
          : [];
    
        // Filter items to match the logged-in user ID
        const filteredItems = itemsList.filter(item => item.userId === auth.currentUser.uid);
        setItems(filteredItems);
        const activeItems = filteredItems.filter(item => item.status === 'active');
        if (activeItems.length > 0) {
          // Set checkbox state for Item List
          const allItemList = activeItems.every(item => 
            item.displayPreferences?.showInItemList === true
          );
          setSelectAllItemList(allItemList);
  
          // Set checkbox state for List Scroll
          const allListScroll = activeItems.every(item => 
            item.displayPreferences?.showInListScroll === true
          );
          setSelectAllListScroll(allListScroll);
  
          // Set checkbox state for Single Scroll
          const allSingleScroll = activeItems.every(item => 
            item.displayPreferences?.showInSingleScroll === true
          );
          setSelectAllSingleScroll(allSingleScroll);
        }
      });
  
      return () => unsubscribe(); 
    }
  }, []);
  
  

  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'items'));
      const itemsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsList);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  

  const handleToggleStatus = async (id) => {
    try {
      const itemRef = ref(rtDatabase, `items/${id}`);
      const item = items.find(item => item.id === id);
      const newStatus = item.status === 'active' ? 'inactive' : 'active';
      
      // When status changes to active, set all display preferences to true
      const newDisplayPreferences = {
        showInItemList: newStatus === 'active' ? true : false,
        showInListScroll: newStatus === 'active' ? true : false,
        showInSingleScroll: newStatus === 'active' ? true : false
      };
      
      await update(itemRef, {
        status: newStatus,
        displayPreferences: newDisplayPreferences
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedItems.map(id => remove(ref(rtDatabase, `items/${id}`)))
      );
      setSelectedItems([]);
      setIsDeleteMode(false);
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  const handleEdit = (id, field, value) => {
    console.log(`Updating ${field} for ${id}: ${value}`); 
    setEditedItems(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };



  const handleSaveEdits = async () => {
    try {
      await Promise.all(
        Object.entries(editedItems).map(([id, data]) =>
          update(ref(rtDatabase, `items/${id}`), data)
        )
      );
      setIsEditMode(false);
      setEditedItems({});
    } catch (error) {
      console.error('Error saving edits:', error);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleToggleDisplay = async (id, displayType) => {
    try {
      const item = items.find(item => item.id === id);
      
      // Only allow toggling display preferences if status is active
      if (item.status === 'active') {
        const updatedPreferences = {
          ...item.displayPreferences,
          [displayType]: !item.displayPreferences[displayType]
        };

        const itemRef = ref(rtDatabase, `items/${id}`);
        await update(itemRef, {
          displayPreferences: updatedPreferences
        });
      }
    } catch (error) {
      console.error('Error updating display preferences:', error);
    }
  };
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();  
      navigate("/");    
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };
 
  const handleFileUploadClick = () => {
    // Show alert first
    alert("Please make sure the Excel file follows this format:\n\n" + 
          "1. Column 'Name' (required): The name of the item.\n" +
          "2. Column 'NativeName' (optional): The native name of the item.\n\n" +
          "3. Column 'Price' (required): The price of the item.\n" +
          "Ensure that all fields are correctly populated before uploading the file.");

    // Trigger the file input to be clicked after the user clicks OK on the alert
    document.getElementById('file-input').click(); 
};


const handleFileUpload = async (e) => {
    const file = e.target.files[0]; 

    if (!file) return; 

    const reader = new FileReader();
    reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet); // Parse to JSON

        if (parsedData.length === 0) {
            alert("No data in the Excel file.");
            e.target.value = ""; // Clear the input after processing
            return;
        }

       
        const normalizedData = parsedData.map(row => {
            const normalizedRow = {};
            Object.keys(row).forEach(key => {
                normalizedRow[key.toLowerCase()] = row[key]; 
            });
            return normalizedRow;
        });

        setExcelData(normalizedData); 
        e.target.value = ""; 
    };

    reader.readAsArrayBuffer(file); 

    setIsUploading1(true); 
};



const uploadExcelData = async () => {
 
    
    setIsUploading(true); 

    try {
        const firestorePromises = [];
        const realtimeDbPromises = [];

        excelData.forEach((row) => {
            // Use lowercase keys here since we normalized them in the previous step
            const formattedItemName = row.name ? row.name.toUpperCase() : "UNNAMED";
            const existingItem = items.find(item => item.name === formattedItemName);

            if (existingItem) {
                const updatedItemData = {
                    nativeName: row.nativename || "",
                    price: row.price || 0,
                    updatedAt: new Date().toISOString(),
                };

                // Update Firestore
                const itemDocRef = doc(db, 'items', existingItem.id);
                firestorePromises.push(updateDoc(itemDocRef, updatedItemData));

                // Update Realtime Database
                const itemRef = ref(rtDatabase, 'items/' + existingItem.id);
                realtimeDbPromises.push(update(itemRef, updatedItemData));
            } else {
                // Create new item if it doesn't exist
                const newItemData = {
                    name: formattedItemName,
                    nativeName: row.nativename || "",
                    price: row.price || 0,
                    image: '',
                    status: "active",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    userId: auth.currentUser.uid,
                    displayPreferences: {
                        showInItemList: false,
                        showInListScroll: false,
                        showInSingleScroll: false
                    }
                };

                // Add new item to Firestore
                firestorePromises.push(addDoc(collection(db, 'items'), newItemData));

                // Add new item to Realtime Database
                const newItemRef = push(ref(rtDatabase, 'items'));
                realtimeDbPromises.push(set(newItemRef, newItemData));
            }
        });

        // Wait for both Firestore and Realtime Database uploads to complete
        await Promise.all([...firestorePromises, ...realtimeDbPromises]);

        alert("Data uploaded successfully!");
        setExcelData([]); 
    } catch (error) {
        // console.error("Error uploading data:", error);
        // alert("Error uploading data. Please try again."); 
    } finally {
        // setIsUploading(false);
        setExcelData([]); 
        setFileInputKey(Date.now()); 
        setIsUploading(false); 
        setIsUploading1(false); 
         
    }
};

    const handleCancel = () => {
      setExcelData([]); 
      setFileInputKey(Date.now()); 
      setIsUploading(false); 
      setIsUploading1(false); 
  };
  
    //image add
      
    const [imagePreview, setImagePreview] = useState(null);
    const [base64Image, setBase64Image] = useState(null);
    const [isUploading2, setIsUploading2] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const handleImageButtonClick = (id) => {
      setCurrentItemId(id); // Set the current item ID
      document.getElementById(`img-input-${id}`).click(); // Trigger specific file input
    };
  // 2. Update the imageUpdate function to handle the edit case

    const imageUpdate = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 500000) { 
          alert("Image size should be less than 500KB");
          return;
        }
    
        setIsUploading2(true);
    
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          setBase64Image(base64String);
          setImagePreview(base64String);
          
          // Automatically trigger update if editing existing image
          if (currentItemId) {
            handleAddImageToItem(base64String, currentItemId);
          }
          
          setIsUploading2(false);
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleAddImageToItem = async (imageData, itemId) => {
      if (!itemId || !imageData) {
        alert("Please select an image");
        return;
      }
    
      try {
        setIsUploading2(true);
        
        const itemData = {
          image: imageData,
          updatedAt: new Date().toISOString()
        };
    
        // Update only Realtime Database
        const realtimeRef = ref(rtDatabase, `items/${itemId}`);
        await update(realtimeRef, itemData);
    
        // Reset states after successful update
        setImagePreview(null);
        setBase64Image(null);
        setCurrentItemId(null);
        setIsUploading2(false);
    
        alert("Image updated successfully!");
      } catch (error) {
        console.error("Error updating item:", error);
        alert("Error updating image. Please try again.");
        setIsUploading2(false);
      }
    };

      const [headerColor, setHeaderColor] = useState("rgb(23, 92, 27)");
      const [logo, setLogo] = useState(logoPlaceholder);
      
       useEffect(() => {
          const fetchHeaderData = async () => {
            const userId = auth.currentUser?.uid; 
            if (!userId) return; 
      
            try {
              const userDocRef = doc(db, `userSettings/${userId}`);
              const snapshot = await getDoc(userDocRef);
      
              if (snapshot.exists()) {
                const data = snapshot.data();
                setHeaderColor(data.headerColor || "rgb(23, 92, 27)"); 
                setLogo(data.logoBase64 || logoPlaceholder); 
                
              }
            } catch (error) {
              console.error("Error fetching header data:", error);
            }
          };
      
          fetchHeaderData();
        }, []);
        const handleSelectAllDisplay = async (displayType) => {
          const activeItems = items.filter(item => item.status === 'active');
          const updates = {};
          
          let isChecked;
          switch (displayType) {
            case 'showInItemList':
              isChecked = !selectAllItemList; // Toggle the value
              setSelectAllItemList(isChecked);
              break;
            case 'showInListScroll':
              isChecked = !selectAllListScroll;
              setSelectAllListScroll(isChecked);
              break;
            case 'showInSingleScroll':
              isChecked = !selectAllSingleScroll;
              setSelectAllSingleScroll(isChecked);
              break;
            default:
              return;
          }
          
          activeItems.forEach(item => {
            updates[`items/${item.id}/displayPreferences/${displayType}`] = isChecked;
          });
      
          try {
            await update(ref(rtDatabase), updates);
          } catch (error) {
            console.error('Error updating display preferences:', error);
          }
        };
        const handleSelectAllRowPreferences = async (itemId) => {
          const item = items.find(item => item.id === itemId);
          if (item?.status !== 'active') return;
      
          // Check if all preferences are currently true
          const allChecked = Object.values(item.displayPreferences || {}).every(val => val === true);
          
          // Toggle to opposite state
          const newState = !allChecked;
      
          try {
            const itemRef = ref(rtDatabase, `items/${itemId}`);
            await update(itemRef, {
              displayPreferences: {
                showInItemList: newState,
                showInListScroll: newState,
                showInSingleScroll: newState
              }
            });
          } catch (error) {
            console.error('Error updating display preferences:', error);
          }
        };
        // 1. Modify the handleImageEdit function to properly handle the image preview
const handleImageEdit = (id) => {
  setCurrentItemId(id);
  setImagePreview(null); // Reset preview when starting new edit
  setBase64Image(null); // Reset base64 data
  document.getElementById(`img-input-${id}`).click();
};
      
        const handleDeleteImage = async (id) => {
          try {
            const itemRef = ref(rtDatabase, `items/${id}`);
            await update(itemRef, {
              image: ''
            });
      
            const firestoreRef = doc(db, "items", id);
            await updateDoc(firestoreRef, {
              image: ''
            });
      
            alert("Image deleted successfully!");
          } catch (error) {
            console.error("Error deleting image:", error);
            alert("Error deleting image. Please try again.");
          }
        };
      
        const handleSelectAll = (e) => {
          setSelectAll(e.target.checked);
          if (e.target.checked) {
            setSelectedItems(filteredItems.map(item => item.id));
          } else {
            setSelectedItems([]);
          }
        };
        
  return (
    <div className="  h-screen overflow-auto relative z-[999] bg-white ">
      <section>
        <div className="flex w-full justify-center items-center flex-col mb-10">
          {/* Navbar */}
          <section
            style={{ backgroundColor: headerColor }}
            className="w-full py-1  top-0 left-0 z-[998]  mb-5"
          >
            <nav className="px-4 flex justify-between items-center ">
              <div className="w-[100px] md:w-[100px] h-auto">
                <img
                  src={logo}
                  className="w-full h-full object-contain drop-shadow-md"
                  alt="Logo"
                />
              </div>
              <div className="flex justify-evenly space-x-4">
                <button
                  className="lg:font-bold font-medium lg:text-2xl text-[#000] bg-[#fff] p-2 rounded-full "
                  onClick={() => navigate("/home")}
                >
                  <FaDisplay />
                </button>
                <button
                  className="lg:font-bold font-medium lg:text-2xl text-[#000] bg-[#fff] p-2 rounded-full "
                  onClick={handleLogout}
                >
                  <FaUserAltSlash />
                </button>
              </div>
            </nav>
          </section>

          {/* Controls */}
          <div className="mb-5 w-full">
            <div className="grid grid-cols-1 place-items-center lg:flex items-center justify-center md:justify-between w-full px-6">
              <div className=" flex justify-center items-center gap-3 mb-5 lg:mb-0">
                <Link to="/addItem">
                  <div className="flex justify-center items-center gap-2 text-[#000]  px-8 py-2 rounded-lg font-semibold border-2 bg-gray-300">
                    Add Item{" "}
                    <span>
                      <BsFillPlusSquareFill />
                    </span>
                  </div>
                </Link>
                <Link to="/BackgroundVideo">
                  <div className="flex justify-center items-center gap-2 text-[#000] px-8 py-2 rounded-lg font-semibold border-2 bg-gray-300">
                    Bg Video{" "}
                    <span>
                      <SiGoogledisplayandvideo360 />
                    </span>
                  </div>
                </Link>
                <Link to="/Settings">
                  <div className="flex justify-center items-center gap-2 text-[#000]px-6 py-3 rounded-lg font-semibold border-2 bg-gray-300">
                    <IoMdSettings />
                  </div>
                </Link>
              </div>
              <div className="grid grid-cols-1 place-content-center md:flex justify-center items-center gap-3">
                <div>
                  <button
                    className="flex justify-center items-center gap-2 text-[#000]  px-8 py-2 rounded-lg font-semibold border-2 bg-gray-300 "
                    onClick={handleFileUploadClick}
                  >
                    Import <PiMicrosoftExcelLogoBold />
                  </button>
                  <input
                    id="file-input"
                    key={fileInputKey}
                    type="file"
                    accept=".xlsx, .xls"
                    style={{ display: "none" }} // Hide the input element
                    onChange={handleFileUpload}
                  />
                </div>
                <>
                  {excelData.length > 0 &&
                    !isUploading && ( // Only show button if there's data and not uploading
                      <div>
                        <button
                          className="flex justify-center items-center gap-2 text-[#000] bg-green-500 px-8 py-2 rounded-lg font-semibold border-2 "
                          onClick={uploadExcelData}
                          disabled={isUploading || excelData.length === 0}
                        >
                          {isUploading ? "Uploading..." : <SiTicktick />}
                        </button>
                        <button
                          className="flex justify-center items-center gap-2 text-[#000] bg-red-500 px-8 py-2 rounded-lg font-semibold border-2 "
                          onClick={handleCancel}
                          disabled={isUploading}
                        >
                          <RxCross2 />
                        </button>
                      </div>
                    )}
                </>

                <div className="relative flex justify-center items-center border-2  rounded-lg">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-8 py-2 rounded-lg outline-none border-none"
                  />
                  <span className="absolute right-2 text-2xl text-[#3c3c3c]  ">
                    <LuSearch />
                  </span>
                </div>
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleSaveEdits}
                      className="flex items-center gap-2 bg-green-500 text-white px-8 py-2 rounded-lg font-semibold border-2"
                    >
                      Save <MdSave />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setEditedItems({});
                      }}
                      className="flex items-center gap-2 bg-red-500 text-white px-8 py-2 rounded-lg font-semibold border-2 "
                    >
                      Cancel <MdCancel />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2 px-8 py-2 rounded-lg font-semibold border-2 bg-gray-300"
                  >
                    Edit <MdModeEditOutline />
                  </button>
                )}
                {isDeleteMode ? (
                  <>
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-2 bg-red-500 text-white px-8 py-2 rounded-lg font-semibold border-2"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => {
                        setIsDeleteMode(false);
                        setSelectedItems([]);
                      }}
                      className="flex items-center gap-2  px-8 py-2 rounded-lg font-semibold border-2 bg-green-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsDeleteMode(true)}
                    className="flex items-center gap-2  px-8 py-2 rounded-lg font-semibold border-2 bg-gray-300"
                  >
                    Delete <MdDelete />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="w-full lg:px-5 overflow-x-auto">
            <table className="rounded-t-xl font-semibold text-[#000] w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  {isDeleteMode && (
                    <th className="p-2">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4"
                      />
                    </th>
                  )}
                  {isDeleteMode}
                  <th className="p-2">No</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Native Name</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">
                    Item List
                    <input
                      type="checkbox"
                      checked={selectAllItemList}
                      onChange={() => handleSelectAllDisplay("showInItemList")}
                      className="ml-2"
                    />
                  </th>
                  <th className="p-2">
                    List Scroll
                    <input
                      type="checkbox"
                      checked={selectAllListScroll}
                      onChange={() =>
                        handleSelectAllDisplay("showInListScroll")
                      }
                      className="ml-2"
                    />
                  </th>
                  <th className="p-2">
                    Single Scroll
                    <input
                      type="checkbox"
                      checked={selectAllSingleScroll}
                      onChange={() =>
                        handleSelectAllDisplay("showInSingleScroll")
                      }
                      className="ml-2"
                    />
                  </th>
                  {/* <th className="p-2">All Preferences</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id} className="border border-gray-300">
                    {isDeleteMode && (
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter((id) => id !== item.id)
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </td>
                    )}
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2 text-center">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedItems[item.id]?.name ?? item.name}
                          onChange={(e) =>
                            handleEdit(
                              item.id,
                              "name",
                              e.target.value.toUpperCase()
                            )
                          }
                          className="px-2 py-1 border rounded"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={
                            editedItems[item.id]?.nativeName ?? item.nativeName
                          }
                          onChange={(e) =>
                            handleEdit(item.id, "nativeName", e.target.value)
                          }
                          className="px-2 py-1 border rounded"
                        />
                      ) : (
                        item.nativeName
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {isEditMode ? (
                        <input
                          type="number"
                          value={editedItems[item.id]?.price ?? item.price}
                          onChange={(e) =>
                            handleEdit(item.id, "price", Number(e.target.value))
                          }
                          className="px-2 py-1 border rounded"
                        />
                      ) : (
                        item.price
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center items-center">
                        {/* Add the input element here, outside of any conditions */}
                        <input
                          id={`img-input-${item.id}`}
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={imageUpdate}
                          disabled={isUploading2}
                        />
                        <div className="w-[50px] h-[50px] rounded-lg bg-[#fff] flex justify-center items-center bg-transparent relative group">
                          {item.image ? (
                            <>
                              <img
                                src={item.image}
                                alt="item"
                                className="w-full h-full object-cover rounded-lg"
                              />
                              {isEditMode && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 flex justify-center items-center space-x-2">
                                  <button
                                    onClick={() => handleImageEdit(item.id)}
                                    className="text-white bg-blue-500 p-1 rounded-full"
                                  >
                                    <MdModeEditOutline />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteImage(item.id)}
                                    className="text-white bg-red-500 p-1 rounded-full"
                                  >
                                    <MdDelete />
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleImageButtonClick(item.id)}
                              >
                                {isUploading2 ? "Uploading..." : <IoIosAdd />}
                              </button>
                              {base64Image && currentItemId === item.id && (
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded shadow-lg z-10">
                                  <img
                                    src={base64Image}
                                    alt="Preview"
                                    className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
                                  />
                                  <button
                                    onClick={handleAddImageToItem}
                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm w-full"
                                  >
                                    Upload
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center items-center">
                        <div
                          className={`relative w-11 h-5 rounded-full cursor-pointer transition-colors ${
                            item.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                          onClick={() => handleToggleStatus(item.id)}
                        >
                          <div
                            className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              item.status === "active"
                                ? "translate-x-6"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={
                          item.displayPreferences?.showInItemList || false
                        }
                        onChange={() =>
                          handleToggleDisplay(item.id, "showInItemList")
                        }
                        disabled={item.status !== "active"}
                        className={
                          item.status !== "active"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={
                          item.displayPreferences?.showInListScroll || false
                        }
                        onChange={() =>
                          handleToggleDisplay(item.id, "showInListScroll")
                        }
                        disabled={item.status !== "active"}
                        className={
                          item.status !== "active"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={
                          item.displayPreferences?.showInSingleScroll || false
                        }
                        onChange={() =>
                          handleToggleDisplay(item.id, "showInSingleScroll")
                        }
                        disabled={item.status !== "active"}
                        className={
                          item.status !== "active"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      />
                    </td>
                    {/* <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={
                        item.status === 'active' &&
                        Object.values(item.displayPreferences || {}).every(val => val === true)
                      }
                      onChange={
                      => handleSelectAllRowPreferences(item.id)}
                      disabled={item.status !== 'active'}
                      className={item.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                  </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPannel;
