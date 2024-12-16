import React, { useState, useEffect } from "react";
import { BsFillPlusSquareFill } from "react-icons/bs";
import { MdModeEditOutline, MdDelete, MdSave, MdCancel } from "react-icons/md";
import { Link } from "react-router-dom";
import { collection, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from './Firebase';
import logo from "../assets/logo.png";
import { auth } from './Firebase';
import { signOut } from 'firebase/auth';

import { useNavigate } from 'react-router-dom';

const Superadmin = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [mode, setMode] = useState(null); // null, 'edit', or 'delete'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

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
fetchUsers()
    const intervalId = setInterval(() => {
      incrementDaysForUsers();
    }, 24 * 60 * 60 * 1000);  // 24 hours in milliseconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Logout function
 

  // Enter Edit Mode
  const handleEditMode = () => {
    setMode('edit');
    setSelectedUsers([]);
  };

  // Enter Delete Mode
  const handleDeleteMode = () => {
    setMode('delete');
    setSelectedUsers([]);
  };

  // Cancel Edit/Delete Mode
  const handleCancelMode = () => {
    setMode(null);
    setSelectedUsers([]);
    setEditingUser(null);
  };

  // Edit User
  const handleEditUser = async (user) => {
    try {
      const userRef = doc(db, 'AdminUser', user.id);
      await updateDoc(userRef, {
        customerName: user.customerName,
        shopName: user.shopName,
        // username: user.username,
        phoneNumber: user.phoneNumber,
        amount: user.amount,
        location: user.location,
        status: user.status,
        email:user.email,
        password:user.password

      });

      // Update local state
      setUsers(users.map(u => u.id === user.id ? user : u));
      setEditingUser(null);
      setMode(null);
    } catch (error) {
      console.error("Error editing user:", error);
    }
  };

  // Delete Selected Users
  const handleDeleteUsers = async () => {
    try {
      // Delete selected users from Firestore
      const deletePromises = selectedUsers.map(userId => 
        deleteDoc(doc(db, 'AdminUser', userId))
      );

      await Promise.all(deletePromises);
      
      // Update local state
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      
      // Clear mode and selected users
      setMode(null);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error deleting users:", error);
    }
  };

  // Toggle user selection
  const toggleUserSelection = (userId) => {
    if (mode === 'delete') {
      setSelectedUsers(prev => 
        prev.includes(userId) 
          ? prev.filter(id => id !== userId)
          : [...prev, userId]
      );
    } else if (mode === 'edit') {
      const userToEdit = users.find(u => u.id === userId);
      setEditingUser(userToEdit);
    }
  };
  const handleLogout = async () => {
    try {
        await signOut(auth);
        navigate("/login");
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

  return (
    <div className="BgBackground h-screen overflow-auto relative z-[999]">
      <section>
        <div className="w-full px-2 py-3 mb-5 NavbarBg">
          <div className="flex justify-between font-bold px-6 items-center text-3xl">
            <div className="w-[100px] md:w-[130px] h-auto">
              <img src={logo} className="w-full h-full object-contain drop-shadow-md" alt="" />
            </div>
            <button className="text-lg lg:text-xl font-rrbold" onClick={handleLogout}>LOGOUT</button>
          </div>
        </div>

        <div className="mb-5 w-full flex items-center justify-center">
          <div className="grid grid-cols-1 place-content-center md:flex justify-center items-center gap-3">
            <div className="flex justify-center items-center gap-3 mb-5 lg:mb-0">
              <Link to="/Adduser">
                <div className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold">
                  Add User <span><BsFillPlusSquareFill /></span>
                </div>
              </Link>
            </div>
            
            <div className="flex justify-center items-center gap-3 mb-5 lg:mb-0">
              <button 
                onClick={handleEditMode}
                className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold"
              >
                Edit <span><MdModeEditOutline /></span>
              </button>
            </div>
            
            <div className="flex justify-center items-center gap-3 mb-5 lg:mb-0">
              <button 
                onClick={handleDeleteMode}
                className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold"
              >
                Delete <span><MdDelete /></span>
              </button>
            </div>

            {(mode === 'edit' || mode === 'delete') && (
                <div className="flex justify-center items-center gap-3 mb-5 lg:mb-0">
                  <button 
                    onClick={mode === 'edit' ? () => handleEditUser(editingUser) : handleDeleteUsers}
                    disabled={mode === 'edit' ? !editingUser : selectedUsers.length === 0}
                    className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold"
                  >
                    Confirm {mode === 'edit' ? 'Edit' : 'Delete'}
                  </button>
                  <button 
                    onClick={handleCancelMode}
                    className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Users Table */}
        <div className="w-full lg:px-5 overflow-x-auto">
          <table className="rounded-t-xl font-semibold text-[#000] w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {(mode === 'edit' || mode === 'delete') && <th className="p-2">Select</th>}
                <th className="p-2">Customer Name</th>
                <th className="p-2">Shop Name</th>
                <th className="p-2">Admin Id</th>
                <th className="p-2">Email</th>
                <th className="p-2">Password</th>
                <th className="p-2">Phone Number</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Location</th>
                <th className="p-2">Status</th>
                <th className="p-2">No. Days</th>
                <th className="p-2">Validity</th>
              </tr>
            </thead>
            <tbody>
              {mode === 'edit' && editingUser ? (
                <tr>
                  <td></td>
                  <td><input value={editingUser.customerName} onChange={(e) => setEditingUser({...editingUser, customerName: e.target.value})} /></td>
                  <td><input value={editingUser.shopName} onChange={(e) => setEditingUser({...editingUser, shopName: e.target.value})} /></td>
                  <td>{editingUser.adminId}</td>
                  <td><input value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} /></td>
                  <td><input value={editingUser.password} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} /></td>
                  <td><input value={editingUser.phoneNumber} onChange={(e) => setEditingUser({...editingUser, phoneNumber: e.target.value})} /></td>
                  <td><input value={editingUser.amount} onChange={(e) => setEditingUser({...editingUser, amount: e.target.value})} /></td>
                  <td><input value={editingUser.location} onChange={(e) => setEditingUser({...editingUser, location: e.target.value})} /></td>
                  <td>
                    <select value={editingUser.status} onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td>{editingUser.numberOfDays || 0}</td>
                  <td>{editingUser.validity ? new Date(editingUser.validity.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} 
                      onClick={() => mode && toggleUserSelection(user.id)}
                      className={`cursor-${mode ? 'pointer' : 'default'} ${
                        mode === 'delete' && selectedUsers.includes(user.id) ? 'bg-red-100' : 
                        mode === 'edit' && editingUser?.id === user.id ? 'bg-blue-100' : ''
                      }`}
                  >
                    {(mode === 'edit' || mode === 'delete') && (
                      <td>
                        <input 
                          type="checkbox" 
                          checked={
                            mode === 'delete' 
                              ? selectedUsers.includes(user.id) 
                              : editingUser?.id === user.id
                          }
                          onChange={() => {}}
                        />
                      </td>
                    )}
                    <td>{user.customerName}</td>
                    <td>{user.shopName}</td>
                    <td>{user.adminId}</td>
                    {/* <td>{user.username}</td> */}
                    <td>{user.email}</td>
                    <td>{user.password}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{user.amount}</td>
                    <td>{user.location}</td>
                    <td>{user.status}</td>
                    <td>{user.numberOfDays || 0}</td>
                    <td>{user.validity ? new Date(user.validity.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Superadmin;