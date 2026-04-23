'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ShieldPlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import './Navbar.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        <Link href="/" className="logo-v2">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="logo-icon-box"
          >
            <Sparkles size={18} fill="currentColor" />
          </motion.div>
          <div className="logo-text-v2">
            <span className="brand-name">SkilliZee</span>
            <span className="product-tag">Competitions</span>
          </div>
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
