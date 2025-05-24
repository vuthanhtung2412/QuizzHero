import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Photo = {
  url: string;
  transcript?: string;
}

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const createPhoto = async (url: string) => {
    let transcript = 'Mock transcript';
    // TODO: Add transcript logic here
    setPhotos(prev => [...prev, { url, transcript }]);
  }

  const deletePhoto = (url: string) => {
    setPhotos(photos => photos.filter(photo => photo.url !== url));
  }

  return {
    photos,
    createPhoto,
    deletePhoto
  }
}
