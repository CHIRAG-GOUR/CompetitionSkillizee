import Link from 'next/link';
import { MapPin, IndianRupee, ExternalLink, ShieldCheck, TrendingUp, CheckCircle, Globe, Zap, Trophy, Star } from 'lucide-react';
import './CompetitionCard.css';

export default function CompetitionCard({ competition }) {
  const { 
    id, 
    title, 
    organizer, 
    description, 
    imageUrl, 
    price, 
    isFree, 
    location, 
    isTrending, 
    sourceSite, 
    trustScore, 
    isLiveResult, 
    isApproved, 
    isPriority 
  } = competition;

  return (
    <Link href={`/competition/${id}`} className={`comp-card-v2 ${isPriority ? 'priority-card' : ''}`}>
      <div className="img-container">
        <img 
          src={imageUrl || 'https://firebasestorage.googleapis.com/v0/b/skillizee-io.firebasestorage.app/o/SkilliZee.io%20Landing%20Page%2FCourse%20Thumbnail%2FSmart%20Startup.png?alt=media'} 
          alt={title} 
          className="card-thumb" 
        />
        <div className="card-badges">
          {isPriority && (
            <div className="badge-pill priority">
              <Trophy size={10} />
              <span>Skillizee Approved</span>
            </div>
          )}
          {isTrending && (
            <div className="badge-pill trending">
              <Star size={10} />
              <span>Trending</span>
            </div>
          )}
          {isLiveResult && (
            <div className="badge-pill discovery">
              <Zap size={10} />
              <span>Skillizee Verified</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="card-body">
        <div className="category-label">
          {location.toUpperCase()} • {isFree ? 'FEES: FREE' : `FEES: ₹${price}`}
        </div>
        <h3 className="card-title">{title}</h3>
        <p className="card-org">{organizer}</p>
        <p className="card-summary">{description}</p>
        
        <div className="card-footer">
          <div className="footer-left">
            <Globe size={12} className="text-slate-400" />
            <span>{sourceSite || 'Official Site'}</span>
          </div>
          <div className="footer-right">
            <ExternalLink size={14} className="text-blue-500" />
          </div>
        </div>
      </div>
    </Link>
  );
}
