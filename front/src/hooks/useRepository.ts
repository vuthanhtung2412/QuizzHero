import { useState } from 'react';

export type Photos = {
  url: string;
  transcript?: string;
}

export const useRepository = () => {
  const [photos, setPhotos] = useState<Photos[]>([]);

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
