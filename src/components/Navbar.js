'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ShieldPlus } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        <Link href="/" className="logo">
          <span className="text-gradient">Skillizee</span> Competitions
        </Link>
        
        <div className="nav-links">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            <Compass size={18} />
            Explore
          </Link>
          <Link href="/admin" className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}>
            <ShieldPlus size={18} />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
