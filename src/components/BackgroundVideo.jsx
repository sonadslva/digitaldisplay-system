import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtDatabase } from './Firebase';

const BackgroundVideo = ({ onShowHome }) => {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  // Fetch videos from Firebase
  useEffect(() => {
    const videosRef = ref(rtDatabase, 'videos');
    const unsubscribe = onValue(videosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const videosList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setVideos(videosList);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (videos.length === 0) {
      onShowHome(true); // Show Home content indefinitely if no videos
      return;
    }

    let initialTimer;
    let rotationTimer;

    // Initial display: Home content for 1 minute
    initialTimer = setTimeout(() => {
      setShowVideo(true); // Show first video
      onShowHome(false);  // Hide Home content
    }, 60000);

    // Rotate between Home and videos
    rotationTimer = setInterval(() => {
      setShowVideo(false); // Show Home content
      onShowHome(true);

      setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
        setShowVideo(true); // Show next video
        onShowHome(false);
      }, 60000); // After 1 minute of Home content
    }, 120000); // Total 2-minute cycle

    return () => {
      clearTimeout(initialTimer);
      clearInterval(rotationTimer);
    };
  }, [videos.length, onShowHome]);

  if (videos.length === 0) return null;

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 w-full h-screen z-[-1]">
      {showVideo && videos[currentVideoIndex] && (
        <iframe
          key={videos[currentVideoIndex].id}
          className="w-full h-full"
          src={`${videos[currentVideoIndex].url}&autoplay=1&mute=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default BackgroundVideo;
