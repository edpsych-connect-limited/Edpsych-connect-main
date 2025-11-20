import React from 'react';
import Link from 'next/link';

const Navigation: React.FC = () => {
  return (
    <nav className="w-full bg-primary text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">EdPsych Connect</h1>
      <div className="space-x-4">
        <Link href="/about">About</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/login">Login</Link>
      </div>
    </nav>
  );
};

export default Navigation;