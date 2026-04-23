'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, ShieldPlus, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsMenuOpen(false); // Close menu if scrolling back up
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar glass-panel ${isVisible ? 'visible' : 'hidden'} ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="container nav-container">
        <Link href="/" className="logo-v2" onClick={() => setIsMenuOpen(false)}>
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
        
        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link 
            href="/" 
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Compass size={18} />
            <span>Explore</span>
          </Link>
          <Link 
            href="/admin" 
            className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <ShieldPlus size={18} />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
