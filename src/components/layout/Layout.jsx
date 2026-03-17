import React from 'react';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="relative">
        {children}
      </main>
    </div>
  );
}