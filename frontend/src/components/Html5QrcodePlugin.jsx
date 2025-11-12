// src/components/Html5QrcodePlugin.jsx
import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Html5QrcodePlugin = ({ fps, qrbox, disableFlip, qrCodeSuccessCallback }) => {
  useEffect(() => {
    const config = { fps, qrbox, disableFlip };
    const html5QrcodeScanner = new Html5QrcodeScanner('qr-reader', config, false);
    
    html5QrcodeScanner.render(
      qrCodeSuccessCallback,
      (errorMessage) => {
        // Handle scan errors silently or log them
        console.log(errorMessage);
      }
    );

    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error('Failed to clear scanner', error);
      });
    };
  }, [fps, qrbox, disableFlip, qrCodeSuccessCallback]);

  return <div id="qr-reader" className="w-full" />;
};

export default Html5QrcodePlugin;
