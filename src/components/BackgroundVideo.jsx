import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { auth, rtDatabase } from './Firebase';

const BackgroundVideo = ({ onShowHome }) => {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  // Track loading state
  const [userId, setUserId] = useState(null);

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

  // Fetch the user ID and videos
  useEffect(() => {
    // Set up a listener for authentication state
    // if (isLoading || !userId || userEmail === 'superadmin@gmail.com') return;
  
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setError('User not logged in');
        onShowHome(true);
      }
      setIsLoading(false);  // Finished loading auth state
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch videos from Firebase when user is authenticated
  useEffect(() => {
    if (isLoading || !userId) return; // Wait for user to be logged in

    const userVideosRef = ref(rtDatabase, `users/${userId}/videos`);
    const unsubscribe = onValue(userVideosRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Raw Firebase data:", data); // Debugging log

      if (data) {
        // Convert data object to an array and filter for valid YouTube videos
        const videosList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })).filter(video => extractYouTubeId(video.url));

        console.log("Processed videos list:", videosList); // Debugging log

        if (videosList.length === 0) {
          setError('No valid YouTube videos found');
          onShowHome(true);
          return;
        }

        setVideos(videosList);
        setError(null);
      } else {
        setError('No videos found');
        onShowHome(true);
      }
    }, (error) => {
      console.error('Firebase fetch error:', error);
      setError('Failed to fetch videos');
      onShowHome(true);
    });

    return () => unsubscribe();
  }, [userId, isLoading, onShowHome]);

  // Video rotation logic
  useEffect(() => {
    if (videos.length === 0) {
      onShowHome(true);
      return;
    }

    let initialTimer;
    let rotationTimer;

    // Initial delay to show the first video
    initialTimer = setTimeout(() => {
      setShowVideo(true);
      onShowHome(false);
    }, 60000); // 1-second delay for testing

    // Rotation logic for subsequent videos
    rotationTimer = setInterval(() => {
      setShowVideo(false);
      onShowHome(true);

      setTimeout(() => {
        setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
        setShowVideo(true);
        onShowHome(false);
      }, 60000); // Show each video for 60 seconds
    }, 120000); // Change video every 2 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(rotationTimer);
    };
  }, [videos.length, onShowHome]);

  // Error handling
  if (error) {
    console.error(error);
    return null;
  }

  if (isLoading) return <div>Loading...</div>;  // Loading state

  if (videos.length === 0) return null;

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 w-full h-screen z-[997]">
      {showVideo && videos[currentVideoIndex] && (
        <iframe
          key={`${videos[currentVideoIndex].id}-${currentVideoIndex}`}
          className="w-full h-full object-cover"
          src={`${formatYouTubeEmbedUrl(videos[currentVideoIndex].url)}?autoplay=1&mute=1&controls=0&loop=1`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default BackgroundVideo;
