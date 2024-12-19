import React, { useState, useEffect } from "react";
import { BsFillPlusSquareFill } from "react-icons/bs";
import { MdModeEditOutline, MdDelete, MdSave, MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";
import { collection, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from './Firebase';
import logo from "../assets/logo.png";
import { auth } from './Firebase';
import { signOut } from 'firebase/auth';
import { FaUserAltSlash } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaRegEdit } from "react-icons/fa";
import { IoPersonAdd } from "react-icons/io5";
import { IoPersonAddSharp } from "react-icons/io5";
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
        const userList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
    const intervalId = setInterval(() => {
      incrementDaysForUsers();
    }, 24 * 60 * 60 * 1000);  // 24 hours in milliseconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
 
  }, []);

  // Update User in Firestore
  const handleEditUser = async () => {
    try {
      const userRef = doc(db, 'AdminUser', editingUser.id);
      await updateDoc(userRef, {
        customerName: editingUser.customerName,
        shopName: editingUser.shopName,
        email: editingUser.email,
        phoneNumber: editingUser.phoneNumber,
        amount: editingUser.amount,
        location: editingUser.location,
        status: editingUser.status,
      });

      // Update state and clear editing mode
      setUsers(users.map(user => (user.id === editingUser.id ? editingUser : user)));
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

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
      const updatedUsers = [...users]; // Copy current users state
      const now = new Date().getTime(); // Current time in milliseconds
  
      for (let user of updatedUsers) {
        const userValidity = new Date(user.validity.seconds * 1000).getTime(); // Convert Firestore timestamp to milliseconds
        const elapsedTime = now - userValidity;
  
        // If more than 24 hours have passed since the last update, increment the number of days
        if (elapsedTime >= 24 * 60 * 60 * 1000) {
          const updatedDays = (user.numberOfDays || 0) + 1;
  
          // Update the Firestore document
          const userRef = doc(db, 'AdminUser', user.id);
          await updateDoc(userRef, { numberOfDays: updatedDays });
  
          // Update the local state
          setUsers(users.map(u => u.id === user.id ? { ...u, numberOfDays: updatedDays } : u));
        }
      }
    } catch (error) {
      console.error("Error incrementing days:", error);
    }
  };
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };
  
  // Function to handle deletion of users
  const handleDeleteUsers = async () => {
    if (!isSelectionMode) {
      // Enable selection mode first
      setIsSelectionMode(true);
      return;
    }
  
    // Proceed with deletion if in selection mode and users are selected
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
    <div className="BgBackground h-screen overflow-auto relative z-[999]">
      <section>
        <div className="w-full px-2 py-3 mb-5 NavbarBg">
          <div className="flex justify-between font-bold px-6 items-center text-3xl">
            <div className="w-[100px] md:w-[130px] h-auto">
              <img src={logo} className="w-full h-full object-contain drop-shadow-md" alt="" />
            </div>
            <button className="text-lg lg:text-xl font-rrbold" onClick={handleLogout}><FaUserAltSlash /></button>
          </div>
        </div>

        <div className="mb-5 w-full flex items-center justify-center ">
          <div className="grid grid-cols-1 md:flex justify-center items-center gap-3 px-3">
            <Link to="/Adduser">
              <div className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold">
                Add User 
                <IoPersonAddSharp />
              </div>
            </Link>
          </div>
          <div className="flex justify-center items-center gap-3 mb-5 lg:mb-0">
          <button
              onClick={handleDeleteUsers}
              className="flex justify-center items-center gap-2 text-[#000] bg-green-500 px-8 py-2 rounded-lg font-semibold"
            >
              {isSelectionMode ? "Confirm Delete" : "Delete"} <MdDelete />
            </button>
                    {isSelectionMode && (
            <button
              onClick={() => {
                setSelectedUsers([]); // Clear selected users
                setIsSelectionMode(false); // Exit selection mode
              }}
              className="flex justify-center items-center gap-2 text-[#000] bg-red-500 px-8 py-2 rounded-lg font-semibold"
            >
              Cancel <MdCancel />
            </button>
          )}
          </div>
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
                <th className="p-2">Phone Number</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Location</th>
                <th className="p-2">Status</th>
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
                      <input
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
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
                    <td>{user.phoneNumber}</td>
                    <td>{user.amount}</td>
                    <td>{user.location}</td>
                    <td>{user.status}</td>
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
