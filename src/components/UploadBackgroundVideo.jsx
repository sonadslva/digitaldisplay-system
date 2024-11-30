import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { rtDatabase } from './Firebase';
import { BsFillPlusSquareFill } from "react-icons/bs";

const UploadBackgroundVideo = () => {
    const [embedUrl, setEmbedUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = async () => {
    if (!embedUrl) return;

    setIsUploading(true);
    try {
      // Extract video ID from YouTube embed URL
      const videoId = embedUrl.match(/embed\/([\w-]+)/)?.[1];
      
      if (!videoId) {
        alert('Please enter a valid YouTube embed URL');
        return;
      }

      // Save to Firebase
      const videosRef = ref(rtDatabase, 'videos');
      await push(videosRef, {
        url: embedUrl,
        videoId: videoId,
        uploadedAt: new Date().toISOString(),
      });

      setEmbedUrl('');
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        value={embedUrl}
        onChange={(e) => setEmbedUrl(e.target.value)}
        placeholder="Paste YouTube embed URL here"
        className="px-4 py-2 rounded-lg outline-none border border-gray-300 w-80"
      />
      <button
        onClick={handleVideoUpload}
        disabled={isUploading}
        className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold"
      >
        {isUploading ? 'Uploading...' : 'Upload Video'} <span><BsFillPlusSquareFill /></span>
      </button>
    </div>
  )
}

export default UploadBackgroundVideo
