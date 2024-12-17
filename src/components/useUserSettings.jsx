import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from './Firebase';
import { getAuth } from 'firebase/auth';

export const useUserSettings = () => {
  const [userSettings, setUserSettings] = useState({
    headerColor: "#000000",
    singleScrollColor: "#ffffff",
    productScrollColor: "#f0f0f0",
    fontColor: "#000000",
    logoPath: null
  });

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    const settingsRef = ref(db, `userSettings/${user.uid}`);
    
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const settings = snapshot.val() || {};
      
      setUserSettings(prevSettings => ({
        headerColor: settings.headerColor?.color || prevSettings.headerColor,
        singleScrollColor: settings.singleScrollColor?.color || prevSettings.singleScrollColor,
        productScrollColor: settings.productScrollColor?.color || prevSettings.productScrollColor,
        fontColor: settings.fontColor?.color || prevSettings.fontColor,
        logoPath: settings.logoPath || prevSettings.logoPath
      }));
    });

    return () => unsubscribe();
  }, []);

  return userSettings;
};