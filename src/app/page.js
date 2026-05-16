'use client';

import { useState, useEffect, useRef } from 'react';
import { getCompetitions } from '@/lib/services';
import CompetitionCard from '@/components/CompetitionCard';
import { Search, SlidersHorizontal, Globe, Loader2, Sparkles, Star, ArrowRight, Trophy, ShieldCheck, Zap, BookOpen, Lightbulb, Rocket, Cpu, Send, Users, Camera } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import ScrollSequence from '@/components/ScrollSequence';
import '@/components/ScrollSequence.css';
import './page.css';

export default function Home() {
  const [competitions, setCompetitions] = useState([]);
  const [filteredComps, setFilteredComps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');

  useEffect(() => {
    // Data Optimisation: Clear previous session search cache
    if (typeof window !== 'undefined') {
      localStorage.removeItem('discovery_cache');
      console.log("Data Optimisation: Previous search cache cleared.");
    }

    async function loadData() {
      const data = await getCompetitions();
      setCompetitions(data);
      setFilteredComps(data);
      setLoading(false);

      const hasFreshData = data.some(c => c.createdAt && new Date(c.createdAt).toDateString() === new Date().toDateString());
      if (!hasFreshData && data.length < 50) {
        handleAutoScout();
      }
    }
    loadData();
  }, []);

  const handleAutoScout = async () => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Prestigious student competitions 2026' })
      });
      const liveResults = await response.json();
      if (liveResults && !liveResults.error) {
        // Cache for detail view
        if (typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('discovery_cache') || '[]');
          localStorage.setItem('discovery_cache', JSON.stringify([...liveResults, ...existing].slice(0, 50)));
        }

        setCompetitions(prev => {
          const newComps = [...liveResults, ...prev];
          return Array.from(new Map(newComps.map(item => [item.title, item])).values());
        });
      }
    } catch (e) {
      console.warn("Auto-scout silented.");
    }
  };

  const handleRefreshResearch = async () => {
    setIsRefreshing(true);
    try {
      const themes = [
        'India National Level school competitions 2026 K-12',
        'Prestigious Indian Olympiads for school students 2026',
        'Top science and innovation contests for kids India 2026',
        'Government of India National school level hackathons 2026',
        'Rajasthan state school innovation summits 2026 iStart',
        'National level creative writing and arts for K-12 India',
        'School level robotics and STEM championships India 2026'
      ];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: randomTheme, isAutoResearch: true })
      });
      const liveResults = await response.json();
      if (liveResults && !liveResults.error) {
        setCompetitions(prev => {
          // Put new results at the very beginning
          const newComps = [...liveResults, ...prev];
          // De-duplicate by title (keep the first occurrence which is the newest)
          return Array.from(new Map(newComps.map(item => [item.title, item])).values());
        });
      }
    } catch (e) {
      console.error("Refresh failed", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLiveSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLiveSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const liveResults = await response.json();
      if (liveResults.error) throw new Error(liveResults.error);

      // Cache for detail view
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('discovery_cache') || '[]');
        localStorage.setItem('discovery_cache', JSON.stringify([...liveResults, ...existing].slice(0, 50)));
      }

      const newComps = [...liveResults, ...competitions];
      const uniqueComps = Array.from(new Map(newComps.map(item => [item.title, item])).values());
      setCompetitions(uniqueComps);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLiveSearching(false);
    }
  };

  useEffect(() => {
    let result = [...competitions];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.detailedDescription && c.detailedDescription.toLowerCase().includes(q))
      );
    }
    if (filterPrice === 'free') result = result.filter(c => c.isFree);
    if (filterPrice === 'paid') result = result.filter(c => !c.isFree);
    if (filterLocation !== 'all') {
      result = result.filter(c => c.location.toLowerCase().includes(filterLocation));
    }

    // STRICT SEPARATION: Exclude Trending from main feed
    result = result.filter(c => !c.isTrending);

    result.sort((a, b) => {
      if (a.isLiveResult && !b.isLiveResult) return -1;
      if (!a.isLiveResult && b.isLiveResult) return 1;
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    setFilteredComps(result);
  }, [competitions, searchQuery, filterPrice, filterLocation]);

  const trendingComps = competitions.filter(c => c.isTrending).slice(0, 4);

  return (
    <div className="home-v2">
      <ScrollSequence totalFrames={300} />

      <div className="main-content-wrapper">
        {/* Background Decorations */}
        <div className="grid-bg" />
        <div className="blur-blob" />

        <section className="hero-v2-section">
          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="hero-title-v2"
            >
              Knowledge is Just the Foundation.
              <div className="hero-divider-yellow"></div>
              <span className="hero-word-alt">Competition</span> <br />
              is Where Greatness is Proven.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-subtitle-v2"
            >
              Every competition is a chapter in your legacy. <br />
              Use the world's most prestigious stages to build your portfolio and prove your potential.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hero-cta-v2"
            >
              <div className="search-box-v2 glass-panel">
                <Search className="text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search STEM, Business, Robotics, Art..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLiveSearch()}
                />
                <button onClick={handleLiveSearch} className="btn-primary-v2" disabled={isLiveSearching}>
                  {isLiveSearching ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  <span>Direct Discovery</span>
                </button>
              </div>

              <div className="accreditation-row">
                <span className="accred-label">ACCREDITED BY:</span>
                <div className="accred-logos">
                  <div className="accred-box bg-slate-800">IIT BOMBAY</div>
                  <div className="accred-box bg-blue-700">BITS HYDERABAD</div>
                  <div className="accred-box bg-emerald-700">STEM ACCREDITED</div>
                  <div className="accred-box bg-amber-500">TOP 5% BEST IN STEM</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <main className="container py-20">
          <div className="feed-header text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-bold tracking-[0.18em] text-blue-700 uppercase">Live Discovery Feed</span>
            </div>
            <h2 className="section-title-v2">Latest Opportunities</h2>
            <p className="section-desc-v2">Skillizee Verified prestigious competitions for your student portfolio.</p>

            <button
              onClick={handleRefreshResearch}
              className="refresh-btn mt-6"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Scanning Global Databases...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Refresh Research</span>
                </>
              )}
            </button>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={40} />
              <p>Scanning Global Databases...</p>
            </div>
          ) : (
            <div className="competitions-grid-v2">
              {filteredComps.map((comp) => (
                <CompetitionCard key={comp.id} competition={comp} />
              ))}
            </div>
          )}


          {trendingComps.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="trending-section-v2 mt-32 pt-20 border-t border-slate-200"
            >
              <div className="feed-header text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-5">
                  <Star className="text-amber-500" size={14} />
                  <span className="text-xs font-bold tracking-[0.18em] text-amber-700 uppercase">Seasonal Highlights</span>
                </div>
                <h2 className="section-title-v2">Trending Right Now</h2>
                <p className="section-desc-v2">Competitions with the highest student engagement and impact score.</p>
              </div>
              <div className="competitions-grid-v2">
                {trendingComps.map((comp, idx) => (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <CompetitionCard competition={comp} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </main>

        <footer className="sk-footer">
          <div className="container py-20 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="footer-brand mb-8"
            >
              <div className="logo-icon-box mx-auto mb-4 scale-125">
                <Sparkles size={20} fill="currentColor" />
              </div>
              <h2 className="footer-logo-text">SKILLIZEE</h2>
              <p className="footer-tagline">Real Skills. Real World. Real Impact.</p>
            </motion.div>

            <div className="footer-links-centered mb-12">
              <a href="#" className="f-link">Privacy Policy</a>
              <span className="dot">•</span>
              <a href="#" className="f-link">Terms of Service</a>
              <span className="dot">•</span>
              <a href="#" className="f-link">Contact Us</a>
              <span className="dot">•</span>
              <a href="#" className="f-link">About Us</a>
            </div>

            <div className="social-row mb-12">
              <a href="#" className="social-circle"><Send size={20} /></a>
              <a href="#" className="social-circle"><Users size={20} /></a>
              <a href="#" className="social-circle"><Camera size={20} /></a>
            </div>

            <div className="footer-bottom pt-8 border-t border-white/5 w-full max-w-2xl">
              <p className="copyright">&copy; 2026 SkilliZee.io - India's #1 Experiential Learning Platform</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
