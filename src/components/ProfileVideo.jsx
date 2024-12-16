import React, { useState, useEffect } from 'react';
import UploadBackgroundVideo from './UploadBackgroundVideo';
import { Link } from "react-router-dom";
import { ref, onValue, remove } from 'firebase/database';
import { auth, rtDatabase } from './Firebase';

const ProfileVideo = () => {
  const [videos, setVideos] = useState([]);
  
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

  // Fetch videos from Firebase
  useEffect(() => {
    const userId = auth.currentUser?.uid; // Get the logged-in user's ID
    if (!userId) {
      console.error("User not logged in.");
      return;
    }

    const userVideosRef = ref(rtDatabase, `users/${userId}/videos`); // Reference the logged-in user's videos
    const unsubscribe = onValue(userVideosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const videosList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // Filter valid videos (valid YouTube URLs)
        const validVideos = videosList.filter(video => extractYouTubeId(video.url));
        
        setVideos(validVideos);
      } else {
        setVideos([]); // If no videos exist, set videos to an empty array
      }
    });

    return () => unsubscribe();
  }, []);

  // Delete video from Firebase
  const handleDelete = (id) => {
    const userId = auth.currentUser?.uid; // Get the logged-in user's ID
    if (!userId) {
      console.error("User not logged in.");
      return;
    }

    const videoRef = ref(rtDatabase, `users/${userId}/videos/${id}`); // Reference the specific video under the user's ID
    remove(videoRef)
      .then(() => {
        console.log("Video deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting video:", error);
      });
  };

  return (
    <div className="h-screen w-full pt-4 fixed z-[999] bg-gradient-to-r from-[#aeff00] to-[#1e9546]">
      <div>
        <div className="flex flex-wrap justify-between px-4 mb-10">
          <Link to="/admin">
            <button className="flex justify-center items-center gap-2 text-[#000] bg-[#ffffff] px-8 py-2 rounded-lg font-semibold">
              Back
            </button>
          </Link>
          <UploadBackgroundVideo />
        </div>

        <div>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {videos.map((video) => (
              <div key={video.id} className="w-80 h-48 border rounded-lg overflow-hidden shadow-md relative">
                <iframe
                  className="w-full h-full"
                  src={`${video.url}?autoplay=1&mute=1`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => handleDelete(video.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileVideo;
