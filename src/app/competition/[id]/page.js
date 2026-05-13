'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCompetitions, submitRegistration, getRelatedCompetitions } from '@/lib/services';
import { ArrowLeft, MapPin, IndianRupee, Calendar, Trophy, Target, Users, Play, ExternalLink, ShieldCheck, Zap, CheckCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import CompetitionCard from '@/components/CompetitionCard';
import './details.css';

export default function CompetitionDetails() {
  const params = useParams();
  const { id } = params;
  
  const [competition, setCompetition] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'strategy', 'hall-of-fame'
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    school: '',
    grade: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchComp() {
      // Import getCompetitionById which handles discovery_cache
      const { getCompetitionById, getRelatedCompetitions } = await import('@/lib/services');
      const comp = await getCompetitionById(id);
      setCompetition(comp);
      
      if (comp) {
        const relatedData = await getRelatedCompetitions(comp);
        setRelated(relatedData);
      }
      setLoading(false);
    }
    fetchComp();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitRegistration(id, formData);
      setSuccess(true);
    } catch (error) {
      alert(error.message || "Failed to submit registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-state">Analyzing Competition Intel...</div>;
  if (!competition) return <div className="empty-state">Data packet not found.</div>;

  return (
    <div className="details-container">
      <div className="details-nav">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} /> Exit Analysis
        </Link>
        <div className="source-badge">
           <ShieldCheck size={14} /> Verified Source: {competition.sourceSite || 'Official Portal'}
        </div>
      </div>
      
      <div className="details-grid">
        {/* Left Column: Rich Content */}
        <div className="content-side">
          <div className="hero-banner glass-panel" style={{ backgroundImage: `url(${competition.imageUrl})` }}>
            <div className="hero-overlay">
              <h1 className="hero-title">{competition.title}</h1>
              <p className="hero-org">Organized by {competition.organizer}</p>
            </div>
          </div>

          <div className="details-tabs">
            <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <Zap size={16} /> Competition Intel
            </button>
            <button className={`tab ${activeTab === 'strategy' ? 'active' : ''}`} onClick={() => setActiveTab('strategy')}>
              <Target size={16} /> Mastery Roadmap
            </button>
          </div>

          <div className="tab-content glass-panel">
            {activeTab === 'overview' && (
              <div className="animate-in">
                <div className="section-block">
                  <h2>Deep Dive: What is it?</h2>
                  <div className="rich-text long-form">{competition.detailedDescription || competition.description}</div>
                </div>

                <div className="intel-grid">
                  <div className="intel-card">
                    <Users size={20} />
                    <div>
                      <h4>Eligibility</h4>
                      <p>{competition.eligibility || 'K-12 Students'}</p>
                    </div>
                  </div>
                  <div className="intel-card">
                    <Trophy size={20} />
                    <div>
                      <h4>Prizes & Awards</h4>
                      <p>{competition.prizes || 'Prestigious Recognition'}</p>
                    </div>
                  </div>
                </div>

                <div className="intel-grid secondary">
                  <div className="intel-card">
                    <MapPin size={20} />
                    <div>
                      <h4>Venue & Mode</h4>
                      <p>{competition.location} ({competition.mode})</p>
                    </div>
                  </div>
                  <div className="intel-card">
                    <IndianRupee size={20} />
                    <div>
                      <h4>Registration Fee</h4>
                      <p>{competition.isFree ? 'FREE' : `₹${competition.price}`}</p>
                    </div>
                  </div>
                </div>

                {competition.videos && competition.videos.length > 0 && (
                  <div className="video-section">
                    <h3>Official Insights & Media</h3>
                    <div className="video-grid">
                      {competition.videos.map((vid, i) => (
                        <a key={i} href={vid.url} target="_blank" className="video-link glass-panel">
                          <Play size={24} />
                          <span>{vid.title || 'Watch Analysis'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'strategy' && (
              <div className="animate-in">
                <h2>Mastery Roadmap: How to Win</h2>
                <div className="roadmap-container">
                  {(competition.howToWin || []).map((step, i) => (
                    <div key={i} className="roadmap-phase glass-panel">
                      <div className="phase-header">
                        <span className="phase-badge">Phase {i + 1}: {step.phase || 'Preparation'}</span>
                      </div>
                      <p className="phase-advice">{step.advice || step}</p>
                      {step.secret_tip && (
                        <div className="secret-box">
                          <Zap size={14} /> <strong>Skillizee Secret Tip:</strong> {step.secret_tip}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!competition.howToWin || competition.howToWin.length === 0) && (
                    <p>Our scouts are currently analyzing winning patterns for this event. Check back soon for the full roadmap.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="form-side">
          <div className="registration-panel glass-panel">
            <h2>Secure Your Entry</h2>
            <p className="form-note">Complete Skillizee registration to access the official application portal.</p>
            
            {success ? (
              <div className="success-ui animate-in">
                <div className="success-icon"><Zap size={40} /></div>
                <h3>Locked & Loaded!</h3>
                <p>Your details are secured. Now, head over to the official site to complete your journey.</p>
                <a href={competition.registrationLink || `https://www.google.com/search?q=${encodeURIComponent(competition.title + ' official website')}`} target="_blank" className="cta-btn primary">
                  Go to Competition Website <ExternalLink size={18} />
                </a>
              </div>
            ) : (
              <div className="form-wrapper">
                <form onSubmit={handleSubmit} className="rich-form">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                  </div>
                  <div className="input-group">
                    <label>WhatsApp Number</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91..." />
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>School</label>
                      <input type="text" name="school" required value={formData.school} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                      <label>Grade</label>
                      <input type="text" name="grade" required value={formData.grade} onChange={handleChange} />
                    </div>
                  </div>
                  <button type="submit" className="cta-btn primary" disabled={submitting}>
                    {submitting ? 'Encrypting Details...' : 'Register for Competition'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="perks-panel glass-panel">
            <h3>Skillizee Edge</h3>
            <ul>
              <li><CheckCircle size={14} /> Expert mentorship available</li>
              <li><CheckCircle size={14} /> Resource guides included</li>
              <li><CheckCircle size={14} /> Direct link to official portal</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <h2>More Like This</h2>
          <div className="related-grid">
            {related.map(comp => (
              <CompetitionCard key={comp.id} competition={comp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
