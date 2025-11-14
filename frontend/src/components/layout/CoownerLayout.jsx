import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function CoownerLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex pt-20">
        <main className="flex-1 px-6">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
