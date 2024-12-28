import React, { useState, useEffect } from "react";
import { BsFillPlusSquareFill } from "react-icons/bs";
import { MdModeEditOutline, MdDelete, MdSave, MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";
import {  collection, updateDoc, deleteDoc, doc, getDocs, getDoc,Timestamp } from "firebase/firestore";
import { db } from './Firebase';
import { auth } from './Firebase';
import { signOut } from 'firebase/auth';
import { FaUserAltSlash, FaRegEdit } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { IoPersonAdd, IoPersonAddSharp } from "react-icons/io5";
const Superadmin = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);


  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'AdminUser'));
        const userList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          

  
          // Convert Firestore timestamps to Date objects or readable strings
          return {
            id: doc.id,
            ...data,
            validity: data.validity ? new Date(data.validity.seconds * 1000).toLocaleDateString() : 'N/A',
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'N/A',
           
          };
          
        });
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };


    fetchUsers();
    const intervalId = setInterval(() => {
      incrementDaysForUsers();
    }, 24 * 60 * 60 * 1000); 
    return () => clearInterval(intervalId);
 
  }, []);

 
  const handleEditUser = async () => {
    try {
      const userRef = doc(db, 'AdminUser', editingUser.id);
      await updateDoc(userRef, {
        customerName: editingUser.customerName,
        shopName: editingUser.shopName,
        email: editingUser.email,
        password:editingUser.password,
        phoneNumber: editingUser.phoneNumber,
        amount: editingUser.amount,
        location: editingUser.location,
        status: editingUser.status,
      });

      
      setUsers(users.map(user => (user.id === editingUser.id ? editingUser : user)));
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };
  // const updateValidityToTwoDays = async () => {
  //   try {
  //     const now = new Date();
  //     const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // Adding 2 days in milliseconds

  //     const updatedUsers = users.map(async (user) => {
  //       const userRef = doc(db, "AdminUser", user.id);
  //       await updateDoc(userRef, { 
  //         validity: twoDaysFromNow,
  //       });

  //       // Update local state as well
  //       setUsers((prevUsers) =>
  //         prevUsers.map((u) =>
  //           u.id === user.id ? { ...u, validity: twoDaysFromNow.toLocaleDateString() } : u
  //         )
  //       );
  //     });

     
  //     await Promise.all(updatedUsers);

  //     console.log("Validity updated for all users to 2 days from now.");
  //   } catch (error) {
  //     console.error("Error updating validity:", error);
  //   }
  // };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const incrementDaysForUsers = async () => {
    try {
        const updatedUsers = [...users];
        const currentDate = Timestamp.fromDate(new Date()); // Convert to Firestore timestamp

        console.log('Starting validity check at:', currentDate.toDate());

        for (let user of updatedUsers) {
            console.log('Checking user:', user.id);

            // Check both validity formats since the data might be in different formats
            const validitySeconds = user.validity?.seconds || 
                                  (typeof user.validity === 'string' ? new Date(user.validity).getTime() / 1000 : null);

            if (!validitySeconds) {
                console.log('Invalid validity date for user:', user.id);
                continue;
            }

            // Convert Firestore timestamps to dates
            const validityDate = new Date(validitySeconds * 1000);
            
            // Calculate remaining days
            const timeDiff = validityDate.getTime() - currentDate.toDate().getTime();
            const remainingDays = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));

            try {
                const userRef = doc(db, 'AdminUser', user.id);
                const updates = {
                    remainingDays,
                    lastUpdated: currentDate
                };

                if (remainingDays === 0) {
                    console.log('Validity expired! Setting user status to inactive:', user.id);
                    updates.status = 'inactive';
                }

                await updateDoc(userRef, updates);

                setUsers(prevUsers => 
                    prevUsers.map((u) => 
                        u.id === user.id 
                            ? { 
                                ...u, 
                                ...updates,
                                status: remainingDays === 0 ? 'inactive' : u.status
                              } 
                            : u
                    )
                );

                console.log(`Successfully updated user ${user.id} with remaining days: ${remainingDays}`);
            } catch (updateError) {
                console.error('Error updating specific user:', user.id, updateError);
            }
        }
    } catch (error) {
        console.error("Error in incrementDaysForUsers:", error);
    }
};
  // Function to manually trigger the check
  const checkNow = () => {
    console.log('Manual check triggered');
    incrementDaysForUsers();
  };
  useEffect(() => {
    const intervalId = setInterval(() => {
      incrementDaysForUsers(); // Call the function every 24 hours
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  
    // Cleanup function
    return () => clearInterval(intervalId);
  }, [users]);
  
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };
  
  
  const handleDeleteUsers = async () => {
    if (!isSelectionMode) {
      // Enable selection mode first
      setIsSelectionMode(true);
      return;
    }
  
    
    try {
      const deletePromises = selectedUsers.map((userId) =>
        deleteDoc(doc(db, "AdminUser", userId))
      );
  
      await Promise.all(deletePromises);
  
      // Update local state
      setUsers(users.filter((user) => !selectedUsers.includes(user.id)));
      setSelectedUsers([]); // Clear selected users
      setIsSelectionMode(false); // Exit selection mode
    } catch (error) {
      console.error("Error deleting users:", error);
    }
  };
  
  return (
    <div className=" h-screen overflow-auto relative z-[999] bg-[#dddada]">
      <section>
      <div className="w-full px-4 py-3 mb-5 bg-[#343A40] shadow-md">
      <div className="flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Super Admin Panel</h1>
        <button
          className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600 transition"
          onClick={handleLogout}
        >
          <FaUserAltSlash size={20} />
        </button>
      </div>
    </div>

    <div className="mb-5 w-full flex flex-col md:flex-row items-center justify-center gap-4">
      <Link to="/Adduser">
        <div className="flex justify-center items-center gap-2 text-[#000] bg-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition">
          Add User
          <IoPersonAddSharp />
        </div>
      </Link>
      
      <div className="flex justify-center items-center gap-3">
        <button
          onClick={handleDeleteUsers}
          className={`flex justify-center items-center gap-2 text-white px-8 py-3 rounded-lg font-semibold ${
            isSelectionMode
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } transition`}
        >
          {isSelectionMode ? "Confirm Delete" : "Delete"} <MdDelete />
        </button>
        {isSelectionMode && (
          <button
            onClick={() => {
              setSelectedUsers([]);
              setIsSelectionMode(false);
            }}
            className="flex justify-center items-center gap-2 text-white bg-gray-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            Cancel <MdCancel />
          </button>
        )}
      </div>
      
        <button 
          onClick={checkNow}
          className="flex justify-center items-center gap-2 text-[#000] bg-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition"
        >
          Check Validity
        </button>
      
   
    </div>
    <div className="mb-5 w-full flex flex-row items-center justify-center gap-4">
          
        </div>
        {/* Users Table */}
        <div className="w-full lg:px-5 overflow-x-auto">
          <table className="rounded-t-xl font-semibold text-[#000] w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
              {(isSelectionMode) && <th className="p-2">Select</th>}
                <th className="p-2">Customer Name</th>
                <th className="p-2">Shop Name</th>
                <th className="p-2">Admin Id</th>
                <th className="p-2">Email</th>
                <th className="p-2">Password</th>
                <th className="p-2">Phone Number</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Location</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created Date</th>
                <th className="p-2">Remaining Days</th>
                <th className="p-2">Validity</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                editingUser?.id === user.id ? (
                  // Editable Row
                  <tr key={user.id} className="bg-blue-100">
                 
                    <td>
                      <input
                        value={editingUser.customerName}
                        onChange={(e) => setEditingUser({ ...editingUser, customerName: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        value={editingUser.shopName}
                        onChange={(e) => setEditingUser({ ...editingUser, shopName: e.target.value })}
                      />
                    </td>
                    <td>{user.adminId}</td>
                    <td>
                      {user.email}
                    </td>
                    <td>
                      <input
                        value={editingUser.password}
                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        value={editingUser.phoneNumber}
                        onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        value={editingUser.amount}
                        onChange={(e) => setEditingUser({ ...editingUser, amount: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        value={editingUser.location}
                        onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        value={editingUser.status}
                        onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td>{user.createdAt}</td>
                    <td>{user.remainingDays}</td>
                    <td>{user.validity}</td>

                    <td>
                      <div className="flex flex-col gap-2 items-center">
                      <button onClick={handleEditUser} className="flex justify-center items-center gap-2 text-[#000] bg-green-400 px-6 py-1 rounded-lg font-semibold text-[13px]">
                        Save<MdSave />
                      </button>
                      <button onClick={() => setEditingUser(null)} className="flex justify-center items-center gap-2  bg-red-400 px-6 py-1 rounded-lg font-semibold text-[13px]">
                       Cancel <MdCancel />
                        
                      </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Default Row
                  <tr key={user.id}>
                     {isSelectionMode && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                        </td>
                      )}
                    <td>{user.customerName}</td>
                    <td>{user.shopName}</td>
                    <td>{user.adminId}</td>
                    <td>{user.email}</td>
                    <td>{user.password}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.amount}</td>
                    <td>{user.location}</td>
                    <td>{user.status}</td>
                    <td>{user.createdAt}</td>
                    <td>{user.remainingDays}</td>
                    <td>{user.validity}</td>
                    <td>
                      <button onClick={() => setEditingUser(user)} className="flex justify-center items-center gap-2 text-white bg-blue-500 px-6 py-1 rounded-sm font-semibold text-[15px]">
                        Edit<FaRegEdit />
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Superadmin;
