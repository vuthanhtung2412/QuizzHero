import { useState } from 'react';

export type Photo = {
  base64Url: string;
}

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const createPhoto = async (base64Url: string) => {
    setPhotos(prev => [...prev, { base64Url }]);
  }

  const deletePhoto = (base64Url: string) => {
    setPhotos(photos => photos.filter(photo => photo.base64Url !== base64Url));
  }

  return {
    photos,
    createPhoto,
    deletePhoto
  }
}
