import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase } from './Firebase';

const BackgroundVideo = () => {
    const [videos, setVideos] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [showVideo, setShowVideo] = useState(true);

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

  // Handle video rotation
  useEffect(() => {
    if (videos.length === 0) return;

    const timer = setInterval(() => {
      setShowVideo(false);
      
      // After showing content, move to next video
      setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
        setShowVideo(true);
      }, 60000); // 1 minute delay
    }, 120000); // 2 minutes total cycle (1 min video + 1 min content)

    return () => clearInterval(timer);
  }, [videos.length]);

  if (videos.length === 0) {
    return null; // Return null when no videos are available
  }
    
  return (
    <div className="fixed top-0 left-0 w-full h-full z-[-1]">
      {showVideo && videos[currentVideoIndex] && (
        <video
          key={videos[currentVideoIndex].id}
          className="w-full h-full object-cover"
          autoPlay
          muted
          src={videos[currentVideoIndex].url}
        />
      )}
    </div>
  )
}

export default BackgroundVideo
