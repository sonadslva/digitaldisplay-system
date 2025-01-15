import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { rtDatabase } from './Firebase';
import { BsFillPlusSquareFill } from "react-icons/bs";
import { getAuth } from 'firebase/auth';

const UploadBackgroundVideo = () => {
  const [embedUrl, setEmbedUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  // YouTube ID Extraction Function
  const extractYouTubeId = (url) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    } catch (err) {
      console.error('Error extracting YouTube ID', err);
      return null;
    }
  };

  // Format URL to Embed URL
  const formatYouTubeEmbedUrl = (url) => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const handleVideoUpload = async () => {
    if (!embedUrl || !user) return;

    setIsUploading(true);
    try {
      // Extract and validate video ID from YouTube URL
      const formattedUrl = formatYouTubeEmbedUrl(embedUrl);
      
      if (!formattedUrl) {
        alert('Please enter a valid YouTube embed URL');
        return;
      }

      // Save to Firebase under the specific user's videos
      const userVideosRef = ref(rtDatabase, `users/${user.uid}/videos`);
      await push(userVideosRef, {
        url: formattedUrl,
        videoId: formattedUrl.split("/").pop(), // Extract videoId from embed URL
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
        className="flex justify-center items-center gap-2 text-[#000]  px-8 py-2 rounded-lg font-semibold border-2 bg-gray-300"
      >
        {isUploading ? 'Uploading...' : 'Upload Video'} <span><BsFillPlusSquareFill /></span>
      </button>
    </div>
  );
}

export default UploadBackgroundVideo;
