import React, { useState, useEffect } from "react";
import { BsFillPlusSquareFill } from "react-icons/bs";
import { LuSearch } from "react-icons/lu";
import { MdModeEditOutline, MdDelete, MdSave, MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";
import { ref, onValue, update, remove } from 'firebase/database';
import { rtDatabase } from './Firebase';
import { auth } from './Firebase';
import { Navigate } from "react-router-dom"

const AdminPannel = () => {
  const [items, setItems] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [editedItems, setEditedItems] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  
  useEffect(() => {
    const itemsRef = ref(rtDatabase, 'items');
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const itemsList = data 
        ? Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }))
        : [];
      setItems(itemsList);
    });

    fetchVideos();

    return () => unsubscribe();
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

  // Fetch videos from Firestore
  const fetchVideos = async () => {
    try {
      const videosQuery = query(collection(db, 'videos'), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(videosQuery);
      const videosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideos(videosList);
    } catch (error) {
      console.error('Error fetching videos:', error);
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

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert video to base64
      const base64Video = await convertFileToBase64(file);
      
      // Save to Firestore
      await addDoc(collection(db, 'videos'), {
        name: file.name,
        videoData: base64Video,
        uploadedAt: new Date().toISOString(),
        duration: await getVideoDuration(file)
      });

      // Refresh videos list
      fetchVideos();
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

   // Helper function to get video duration
   const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  // Logout Function
  const handleLogout = async () => {
    try {
      await auth.signOut();   
      Navigate("/login");        
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };


  return (
    <div className=" BgBackground h-screen overflow-auto">
      <section>
        <div className="flex w-full justify-center items-center flex-col mb-10">
          {/* Navbar */}
          <div className="w-full px-2 py-3 mb-5 bg-[#fff]">
            <div className="flex justify-between font-bold px-6 items-center text-3xl">
              <div>Logo</div>
              <button className="text-lg font-semibold" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-5 w-full">
            <div className="grid grid-cols-1 place-items-center lg:flex items-center justify-center md:justify-between w-full px-6">
              <div className=" flex justify-center items-center gap-3 mb-5 lg:mb-0">
                <Link to="/addIitem">
                  <div className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold">
                    Add Item <span><BsFillPlusSquareFill /></span>
                  </div>
                </Link>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold">
                    {isUploading ? 'Uploading...' : 'Upload Video'} <span><BsFillPlusSquareFill /></span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 place-content-center md:flex justify-center items-center gap-3">
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
                        <div className="w-[50px] h-[50px] rounded-lg bg-[#fff] flex justify-center items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
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
