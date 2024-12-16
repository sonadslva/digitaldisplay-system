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
      
      // Update the status and display preferences based on the new status
      await update(itemRef, {
        status: newStatus,
        displayPreferences: {
          showInItemList: newStatus === 'active' ? false : false,
          showInListScroll: newStatus === 'active' ? false : false,
          showInSingleScroll: newStatus === 'active' ? false : false
        }
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
      navigate("/login");    
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };
 
 
   
  
    // Handle file upload and parse Excel
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
  
          // Check if parsed data is empty
          if (parsedData.length === 0) {
              alert("No data in the Excel file.");
              return;
          }
  
          setExcelData(parsedData); // Set parsed data to state
          
      };
      reader.readAsArrayBuffer(file);
    
  
      // No need to check here, move this to the onload function
      setIsUploading1(true);
      alert("click upload to add data!")
    };
    const uploadExcelData = async () => {
      setIsUploading(true);
  
      try {
          const firestorePromises = [];
          const realtimeDbPromises = [];
  
          // Loop through the Excel data and prepare the data for Firebase upload
          excelData.forEach((row) => {
              // Find the existing item by name
              const existingItem = items.find(item => item.name === row.name);
              
              if (existingItem) {
                  // If the item name matches, update the price
                  const updatedItemData = {
                      price: row.price || 0, // Only update the price field
                      updatedAt: new Date().toISOString(), // Optionally add a timestamp for updates
                  };
  
                  // Update data in Firestore
                  const itemDocRef = doc(db, 'items', existingItem.id); // Assuming `existingItem.id` is the Firestore document ID
                  firestorePromises.push(updateDoc(itemDocRef, updatedItemData));
  
                  // Update data in Realtime Database
                  const itemRef = ref(rtDatabase, 'items/' + existingItem.id); // Assuming `existingItem.id` is the key in Realtime DB
                  realtimeDbPromises.push(update(itemRef, updatedItemData));
              } else {
                  // If the item doesn't exist, create a new item
                  const newItemData = {
                      name: row.name || "Unnamed",
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
  
                  // Add the new item to Firestore
                  firestorePromises.push(addDoc(collection(db, 'items'), newItemData));
  
                  // Add the new item to Realtime Database
                  const newItemRef = push(ref(rtDatabase, 'items'));
                  realtimeDbPromises.push(set(newItemRef, newItemData));
              }
          });
  
          // Wait for both Firestore and Realtime Database uploads to complete
          await Promise.all([...firestorePromises, ...realtimeDbPromises]);
  
          alert("Data uploaded successfully!");
          setExcelData([]); // Clear the excelData after successful upload
      } catch (error) {
          console.error("Error uploading data:", error);
          alert("Error uploading data. Please try again.");
      } finally {
          setIsUploading(false);
      }
  };
  

    //image add
      
    const [imagePreview, setImagePreview] = useState(null);
    const [base64Image, setBase64Image] = useState(null);
    const [isUploading2, setIsUploading2] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
  
    const handleImageButtonClick = (id) => {
      setCurrentItemId(id); // Set the current item ID
      document.getElementById(`img-input-${id}`).click(); // Trigger specific file input
    };
  
    const imageUpdate = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 500000) { // 500KB limit
          alert("Image size should be less than 500KB");
          return;
        }
  
        setIsUploading2(true);
  
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result; // Convert file to Base64 string
          setBase64Image(base64String);
          setImagePreview(base64String);
          setIsUploading2(false);
        };
        reader.readAsDataURL(file); // Start reading the file
      }
    };
  
    const handleAddImageToItem = async () => {
      if (!currentItemId || !base64Image) {
        alert("Please select an image");
        return;
      }
    
      try {
        const itemData = {
          image: base64Image, // Store Base64 string
        };
    
       // First, check if the item exists in Firestore
    const firestoreRef = doc(db, "items", currentItemId);
    
    // Use setDoc with merge option to create or update the document
    await setDoc(firestoreRef, itemData, { merge: true });

    // Update Realtime Database
    const realtimeRef = ref(rtDatabase, `items/${currentItemId}`);
    await update(realtimeRef, itemData);

    alert("Item updated with new image!");

    setImagePreview(null);
    setBase64Image(null);
    setCurrentItemId(null);
      } catch (error) {
        console.error("Error updating item:", error);
        alert("Error updating item. Please try again.");
      }
     
    };
    
  return (
    <div className=" BgBackground h-screen overflow-auto relative z-[999] bg-[#fff]">
      <section>
        <div className="flex w-full justify-center items-center flex-col mb-10">
          {/* Navbar */}
          <div className="w-full px-2 py-3 mb-5 NavbarBg">
            <div className="flex justify-between font-bold px-6 items-center text-3xl">
              <div className="w-[100px] md:w-[130px] h-auto">
                <img src={logo} className="w-full h-full object-contain drop-shadow-md" alt="" />
              </div>
              <div className="flex justify-evenly space-x-4">
              <button className="lg:font-bold font-medium lg:text-2xl text-[#000] " onClick={() => navigate("/home")}>HOME</button>
              <button className="lg:font-bold font-medium lg:text-2xl text-[#000] " onClick={handleLogout}>LOGOUT</button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-5 w-full">
            <div className="grid grid-cols-1 place-items-center lg:flex items-center justify-center md:justify-between w-full px-6">
              <div className=" flex justify-center items-center gap-3 mb-5 lg:mb-0">
                <Link to="/addItem">
                  <div className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold">
                    Add Item <span><BsFillPlusSquareFill /></span>
                  </div>
                </Link>
                <Link to="/BackgroundVideo">
                  <div className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold">
                    Bg Video <span><SiGoogledisplayandvideo360 /></span>
                  </div>
                </Link>
              </div>
              <div className="grid grid-cols-1 place-content-center md:flex justify-center items-center gap-3">
                <div>
                  <button className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold" onClick={() => document.getElementById('file-input').click()}>Import Excel</button>
                  <input
                    id="file-input"
                    type="file"
                    accept=".xlsx, .xls"
                    style={{ display: 'none' }} // Hide the input element
                    onChange={handleFileUpload}
                    />
                </div>
                <div>
                <button className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold" onClick={uploadExcelData} disabled={isUploading || excelData.length === 0}>
                {isUploading ? "Uploading..." : "Upload Data"}
              </button>
                </div>
                <div className="relative flex justify-center items-center">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-8 py-2 rounded-lg outline-none border-none"
                  />
                  <span className="absolute right-2 text-2xl text-[#3c3c3c]">
                    <LuSearch />
                  </span>
                </div>
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleSaveEdits}
                      className="flex items-center gap-2 bg-green-500 text-white px-8 py-2 rounded-lg font-semibold"
                    >
                      Save <MdSave />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setEditedItems({});
                      }}
                      className="flex items-center gap-2 bg-red-500 text-white px-8 py-2 rounded-lg font-semibold"
                    >
                      Cancel <MdCancel />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2 bg-[#fff] px-8 py-2 rounded-lg font-semibold"
                  >
                    Edit <MdModeEditOutline />
                  </button>
                )}
                {isDeleteMode ? (
                  <>
                    <button
                      onClick={handleDeleteSelected}
                      className="flex items-center gap-2 bg-red-500 text-white px-8 py-2 rounded-lg font-semibold"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => {
                        setIsDeleteMode(false);
                        setSelectedItems([]);
                      }}
                      className="flex items-center gap-2 bg-[#fff] px-8 py-2 rounded-lg font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsDeleteMode(true)}
                    className="flex items-center gap-2 bg-[#fff] px-8 py-2 rounded-lg font-semibold"
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
                  {isDeleteMode && <th className="p-2">Select</th>}
                  <th className="p-2">No</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Image</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Item List</th>
                  <th className="p-2">List Scroll</th>
                  <th className="p-2">Single Scroll</th>
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
                              setSelectedItems(selectedItems.filter(id => id !== item.id));
                            }
                          }}
                        />
                      </td>
                    )}
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2 text-center">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editedItems[item.id]?.name ?? item.name}
                          onChange={(e) => handleEdit(item.id, 'name', e.target.value)}
                          className="px-2 py-1 border rounded"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {isEditMode ? (
                        <input
                          type="number"
                          value={editedItems[item.id]?.price ?? item.price}
                          onChange={(e) => handleEdit(item.id, 'price', Number(e.target.value))}
                          className="px-2 py-1 border rounded"
                        />
                      ) : (
                        item.price
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center items-center">
                        <div className="w-[50px] h-[50px] rounded-lg bg-[#fff] flex justify-center items-center bg-transparent">
                        {item.image ? (
                              <img
                                src={item.image}
                                alt="item"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <>
                                <button onClick={() => handleImageButtonClick(item.id)}>
                                  {isUploading2 ? "Uploading..." : "+"}
                                </button>
                                <input
                                  id={`img-input-${item.id}`}
                                  type="file"
                                  style={{ display: "none" }}
                                  onChange={imageUpdate}
                                  disabled={isUploading2}
                                />
                                {base64Image && currentItemId === item.id && (
                                  <div className="bg-white" >
                                    <img 
                                      src={base64Image} 
                                      alt="Preview" 
                                      className="w-30 h-5 object-cover rounded-lg mx-auto mb-3"
                                    />
                                    <button 
                                      onClick={handleAddImageToItem}
                                      className="text-xs bg-green-500 text-white px-5 py-1 rounded inline-block w-50"
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
                            item.status === 'active' ? "bg-green-500" : "bg-gray-300"
                          }`}
                          onClick={() => handleToggleStatus(item.id)}
                        >
                          <div
                            className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                              item.status === 'active' ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.displayPreferences?.showInItemList || false}
                      onChange={() => handleToggleDisplay(item.id, 'showInItemList')}
                      disabled={item.status !== 'active'}
                      className={item.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                      </td>
                      <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.displayPreferences?.showInListScroll || false}
                        onChange={() => handleToggleDisplay(item.id, 'showInListScroll')}
                        disabled={item.status !== 'active'}
                        className={item.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}
                      />
                      </td>
                      <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={item.displayPreferences?.showInSingleScroll || false}
                        onChange={() => handleToggleDisplay(item.id, 'showInSingleScroll')}
                        disabled={item.status !== 'active'}
                        className={item.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}
                      />
                      </td>
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
