import React, { useState, useEffect } from 'react';
import UploadBackgroundVideo from './UploadBackgroundVideo';
import { Link } from "react-router-dom";
import { ref, onValue, remove } from 'firebase/database';
import { rtDatabase } from './Firebase';

const ProfileVideo = () => {
  const [videos, setVideos] = useState([]);

  // Fetch videos from Firebase
  useEffect(() => {
    const videosRef = ref(rtDatabase, 'videos');
    const unsubscribe = onValue(videosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const videosList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setVideos(videosList);
      }
    });

    return () => unsubscribe();
  }, []);

  // Delete video from Firebase
  const handleDelete = (id) => {
    const videoRef = ref(rtDatabase, `videos/${id}`);
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
                  src={`${video.url}&autoplay=1&mute=1`}
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
