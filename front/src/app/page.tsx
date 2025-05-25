"use client"

import { useState, useRef, useEffect } from 'react';
import PhotoGallery from '../components/PhotoGallery';
import { usePhotos } from '@/hooks/usePhotos';
import { Button } from "@/components/ui/button";
import { QuizDialog } from '@/components/QuizDialog';
import { Loader2, Volume2 } from 'lucide-react';

export default function FrontCameraCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const {
    photos,
    createPhoto,
    deletePhoto
  } = usePhotos()

  const startCamera = async () => {
    try {
      setError('');

      // Request access to front camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 'environment' for back camera, 'user' for front camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setHasPermission(true);
      }
    } catch (err: unknown) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);

      if ((err as Error).name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions in your browser settings.');
      } else if ((err as Error).name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if ((err as Error).name === 'NotSupportedError') {
        setError('Camera not supported on this device/browser.');
      } else {
        setError('Failed to access camera: ' + (err as Error).message);
      }
    }
  };

  const takePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      if (context) {
        context.drawImage(videoRef.current, 0, 0);
      }

      // Convert to data URL and add to photos array
      const dataUrlBase64 = canvas.toDataURL('image/jpeg', 0.9);
      await createPhoto(dataUrlBase64);
    }
  };

  // Check if camera API is supported and start camera automatically
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera API not supported in this browser');
      setHasPermission(false);
      return;
    }
    startCamera();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Take pictures of your lesson notes
        </h1>

        {/* Video element */}
        <div className="relative mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full rounded-lg ${isStreaming ? 'block' : 'hidden'}`}
            style={{ transform: 'none' }}
          />

          {!isStreaming && (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    {/* TODO: make this cleaner */}
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586l-.707-.707A1 1 0 0012.293 4H7.707a1 1 0 00-.707.293L6.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-500">Camera not active</p>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          {isStreaming && (
            <>
              <Button
                onClick={takePhoto}
              >
                Take Photo
              </Button>
            </>
          )}

          {photos.length > 0 && (
            <>
              <QuizDialog photosBase64Url={photos.map(photo => photo.base64Url)} />
            </>
          )}
        </div>

        {/* Photo Gallery */}
        <PhotoGallery photos={photos.map((photo) => photo.base64Url)} onDeletePhoto={deletePhoto} />
      </div>
    </div>
  );
}
