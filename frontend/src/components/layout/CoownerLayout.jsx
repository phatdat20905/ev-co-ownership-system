import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CoownerSidebar from './CoownerSidebar';

export default function CoownerLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex pt-20">
        <CoownerSidebar />
        
        <main className="flex-1">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
