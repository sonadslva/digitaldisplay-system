import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { addDoc, collection } from 'firebase/firestore';
import { db, rtDatabase } from './Firebase';
import { push, ref } from 'firebase/database';

const AddItem = () => {
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [base64Image, setBase64Image] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    // const storage = getStorage();

     // Handle image change and preview
     const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 500000) { // 500KB limit
            alert('Image size should be less than 500KB');
            return;
          }
    
          setIsUploading(true);
          const reader = new FileReader();
          
          reader.onloadend = () => {
            setImagePreview(reader.result);
            setBase64Image(reader.result);
            setIsUploading(false);
          };
    
          reader.onerror = () => {
            alert('Error reading file');
            setIsUploading(false);
          };
    
          reader.readAsDataURL(file);
        }
    };

       const handleAddItem = async () => {
        try {
            if (!itemName || !itemPrice) {
                alert('Please fill in the item name and price');
                return;
            }

            if (!base64Image) {
                alert('Please select an image');
                return;
            }

            const itemData = {
                name: itemName,
                price: Number(itemPrice),
                image: base64Image,
                status: 'active',
                createdAt: new Date().toISOString(),
                displayPreferences: {
                    showInItemList: false,
                    showInListScroll: false,
                    showInSingleScroll: false
                }
            };

            // Add to Firestore
            await addDoc(collection(db, 'items'), itemData);

            // Add to Realtime Database
            await push(ref(rtDatabase, 'items'), itemData);

            navigate('/admin');
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Error adding item. Please try again.');
        }
    };

  return (
    <div className='flex justify-center items-center h-screen w-full flex-col'>
      <div className='h-auto w-[700px] bg-[#414141] rounded-3xl'>
        <div className='w-full flex flex-col gap-5 py-10 px-4'>
          <div className='mb-3 font-bold text-[#fff] text-3xl text-center'>Add Item</div>
          
          <input
            type="text"
            placeholder='Item Name'
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className='px-8 py-2 rounded-lg w-full border-none outline-none'
          />
          
          <input
            type="number"
            placeholder='Item Price'
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            className='px-8 py-2 rounded-lg w-full border-none outline-none'
          />
          
          <div className='flex flex-col gap-3'>
            <input
              type="file"
              accept="image/jpeg, image/png, image/gif"
              onChange={handleImageChange}
              className='hidden'
              id="imageInput"
            />

          {/* <div className='flex flex-col gap-3 text-white'>
              <div className='text-lg font-semibold'>Display Options:</div>
              <div className='flex gap-4'>
                  <label className='flex items-center gap-2'>
                      <input
                          type="checkbox"
                          checked={displayPreferences.showInItemList}
                          onChange={(e) => setDisplayPreferences(prev => ({
                              ...prev,
                              showInItemList: e.target.checked
                          }))}
                      />
                      Show in Item List
                  </label>
                  <label className='flex items-center gap-2'>
                      <input
                          type="checkbox"
                          checked={displayPreferences.showInListScroll}
                          onChange={(e) => setDisplayPreferences(prev => ({
                              ...prev,
                              showInListScroll: e.target.checked
                          }))}
                      />
                      Show in List Scroll
                  </label>
                  <label className='flex items-center gap-2'>
                      <input
                          type="checkbox"
                          checked={displayPreferences.showInSingleScroll}
                          onChange={(e) => setDisplayPreferences(prev => ({
                              ...prev,
                              showInSingleScroll: e.target.checked
                          }))}
                      />
                      Show in Single Scroll
                  </label>
              </div>
          </div> */}
            
            <button
              onClick={() => document.getElementById('imageInput').click()}
              className='px-8 py-2 bg-[#fff] rounded-lg font-semibold'
              disabled={isUploading}
            >
              {isUploading ? 'Processing Image...' : 'Select Image'}
            </button>

            {imagePreview && (
              <div className='flex justify-center flex-col items-center gap-2'>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className='h-40 w-40 object-cover rounded-lg'
                />
                <button
                  onClick={() => {
                    setImagePreview('');
                    setBase64Image('');
                  }}
                  className='text-white underline'
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className='flex justify-center items-center gap-5 mt-4'>
            <Link to="/admin">
              <button className='px-8 py-2 bg-[#fff] rounded-lg font-semibold'>Cancel</button>
            </Link>
            <button
              onClick={handleAddItem}
              className='px-8 py-2 bg-[#fff] rounded-lg font-semibold'
              disabled={isUploading}
            >
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddItem
