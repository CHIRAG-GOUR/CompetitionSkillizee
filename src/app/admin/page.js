'use client';

import { useState, useEffect } from 'react';
import { 
  getCompetitions, 
  addCompetition, 
  getRegistrations, 
  verifyAdmin, 
  createAdmin, 
  getAdmins,
  deleteCompetition,
  updateCompetition
} from '@/lib/services';
import { 
  Plus, 
  List, 
  Trash2, 
  Edit, 
  Trophy, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Search, 
  Zap, 
  ShieldCheck, 
  Users, 
  Lock,
  Mail,
  UserPlus,
  ShieldAlert,
  Loader2,
  Star,
  Eye
} from 'lucide-react';
import CompetitionCard from '@/components/CompetitionCard';
import './admin.css';

export default function AdminDashboard() {
  // Authorization States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Data States
  const [competitions, setCompetitions] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'list', 'registrations', 'admins'

  // Form States
  const [compData, setCompData] = useState({
    title: '',
    organizer: '',
    description: '',
    detailedDescription: '',
    imageUrl: '',
    price: 0,
    isFree: true,
    location: '',
    mode: 'online',
    isTrending: false,
    registrationLink: '',
    howToWin: [],
    videos: [],
    eligibility: '',
    prizes: ''
  });

  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    name: '',
    role: 'editor'
  });

  const [saving, setSaving] = useState(false);
  const [quickUrl, setQuickUrl] = useState('');
  const [fetching, setFetching] = useState(false);

  // handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const user = await verifyAdmin(adminEmail, adminPassword);
    if (user) {
      setIsAuthorized(true);
      setCurrentUser(user);
      localStorage.setItem('admin_session', JSON.stringify(user));
    } else {
      setLoginError('Access Denied: Invalid ID or Password');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setCurrentUser(null);
    localStorage.removeItem('admin_session');
  };

  useEffect(() => {
    const session = localStorage.getItem('admin_session');
    if (session) {
      const user = JSON.parse(session);
      setIsAuthorized(true);
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === 'registrations') {
        const data = await getRegistrations();
        setRegistrations(data);
      } else if (activeTab === 'list' || activeTab === 'add') {
        const data = await getCompetitions();
        setCompetitions(data);
      } else if (activeTab === 'admins') {
        const data = await getAdmins();
        setAdmins(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this competition forever?")) return;
    try {
      await deleteCompetition(id);
      loadData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleToggleTrending = async (comp) => {
    try {
      await updateCompetition(comp.id, { isTrending: !comp.isTrending });
      loadData();
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleTogglePriority = async (comp) => {
    try {
      await updateCompetition(comp.id, { isPriority: !comp.isPriority });
      loadData();
    } catch (err) {
      alert("Update failed");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'super') {
      alert("Only Super Admin can authorize new personnel.");
      return;
    }
    setSaving(true);
    try {
      await createAdmin(newAdmin);
      alert("Admin Created!");
      setNewAdmin({ email: '', password: '', name: '', role: 'editor' });
      const data = await getAdmins();
      setAdmins(data);
    } catch (err) {
      alert("Failed to create admin");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickFetch = async () => {
    if (!quickUrl) return;
    setFetching(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `Analyze competition at ${quickUrl}` })
      });
      const results = await res.json();
      if (results && results.length > 0) {
        const data = results[0];
        setCompData({
          ...compData,
          title: data.title || '',
          organizer: data.organizer || '',
          description: data.description || '',
          detailedDescription: data.detailedDescription || '',
          imageUrl: data.imageUrl || '',
          registrationLink: data.registrationLink || quickUrl,
          location: data.location || '',
          mode: data.mode || 'online',
          howToWin: data.howToWin || [],
          videos: data.videos || [],
          eligibility: data.eligibility || '',
          prizes: data.prizes || ''
        });
      }
    } catch (err) {
      alert("AI Scan failed");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addCompetition(compData);
      alert('Competition Published!');
      setCompData({
        title: '', organizer: '', description: '', detailedDescription: '',
        imageUrl: '', price: 0, isFree: true, location: '', mode: 'online',
        isTrending: false, registrationLink: '', howToWin: [], videos: [],
        eligibility: '', prizes: ''
      });
      setActiveTab('list');
    } catch (err) {
      alert('Error publishing');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="admin-gateway">
        <div className="login-box glass-panel animate-in">
          <div className="lock-icon">
            <Lock size={40} />
          </div>
          <h1>Skillizee Control</h1>
          <p>Access restricted to authorized administrators.</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <Mail size={16} />
              <input type="email" placeholder="Admin Email ID" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <Lock size={16} />
              <input type="password" placeholder="Password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
            </div>
            {loginError && <p className="error-text">{loginError}</p>}
            <button type="submit" className="login-btn">Authenticate <ShieldCheck size={18} /></button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="admin-container">
      <div className="admin-header">
        <div className="header-top">
          <div>
            <h1>Admin Console</h1>
            <p className="admin-id">Logged in as: {currentUser?.email} ({currentUser?.role})</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
        
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}><Plus size={18} /> Add New</button>
          <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}><List size={18} /> Manage</button>
          <button className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`} onClick={() => setActiveTab('registrations')}><Users size={18} /> Registrations</button>
          {currentUser?.role === 'super' && <button className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}><ShieldAlert size={18} /> Admins</button>}
        </div>
      </div>

      <div className="admin-content glass-panel animate-in">
        {activeTab === 'add' && (
          <div className="admin-grid-layout">
            <div className="admin-form-section">
              <div className="section-header"><h2>Publish Competition</h2><span className="badge">Priority Listing</span></div>
              <div className="quick-fetch glass-panel">
                <p>Already have a URL? Let Gemini fill the form for you.</p>
                <div className="input-with-action">
                  <input type="text" placeholder="Paste competition website URL..." value={quickUrl} onChange={(e) => setQuickUrl(e.target.value)} />
                  <button onClick={handleQuickFetch} className={`fetch-btn ${fetching ? 'fetching' : ''}`} disabled={fetching}>
                    {fetching ? <Zap size={16} className="icon-spin" /> : <Zap size={16} />}
                    {fetching ? 'Scanning...' : 'Zap Fetch'}
                  </button>
                </div>
              </div>
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group"><label>Title</label><input type="text" value={compData.title} onChange={e => setCompData({...compData, title: e.target.value})} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Organizer</label><input type="text" value={compData.organizer} onChange={e => setCompData({...compData, organizer: e.target.value})} required /></div>
                  <div className="form-group"><label>Location</label><input type="text" value={compData.location} onChange={e => setCompData({...compData, location: e.target.value})} required /></div>
                </div>
                <div className="form-group"><label>Intelligence Description</label><textarea rows="6" value={compData.detailedDescription} onChange={e => setCompData({...compData, detailedDescription: e.target.value})} required></textarea></div>
                <div className="form-row">
                  <div className="form-group"><label>Image URL</label><input type="text" value={compData.imageUrl} onChange={e => setCompData({...compData, imageUrl: e.target.value})} /></div>
                  <div className="form-group"><label>Registration Link</label><input type="text" value={compData.registrationLink} onChange={e => setCompData({...compData, registrationLink: e.target.value})} required /></div>
                </div>
                <div className="status-row">
                  <label className="checkbox-wrapper"><input type="checkbox" checked={compData.isTrending} onChange={e => setCompData({...compData, isTrending: e.target.checked})} /> Trending</label>
                  <label className="checkbox-wrapper"><input type="checkbox" checked={compData.isFree} onChange={e => setCompData({...compData, isFree: e.target.checked})} /> Free Entry</label>
                </div>
                <button type="submit" className="admin-submit-btn" disabled={saving}>{saving ? 'Publishing...' : 'Publish Competition'}</button>
              </form>
            </div>
            <div className="preview-section">
              <h3>Live Card Preview</h3>
              <div className="preview-card-container"><CompetitionCard competition={{...compData, isApproved: true, isPriority: true, id: 'preview'}} /></div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="admin-list-view">
            <div className="section-header"><h2>Inventory Management</h2><p>Promote, demote, or remove competitions.</p></div>
            {loading ? <div className="loading-center"><Loader2 className="animate-spin" /></div> : (
              <div className="manage-grid">
                {competitions.map(comp => (
                  <div key={comp.id} className={`manage-card glass-panel ${comp.isPriority ? 'priority' : ''}`}>
                    <div className="manage-card-img" style={{ backgroundImage: `url(${comp.imageUrl})` }}>
                      {comp.isPriority && <span className="m-badge approved">Approved</span>}
                      {comp.isTrending && <span className="m-badge trending">Trending</span>}
                    </div>
                    <div className="manage-card-content">
                      <div className="manage-info">
                        <h3>{comp.title}</h3>
                        <p className="org">{comp.organizer}</p>
                        <div className="meta-tags"><span>{comp.location}</span><span>•</span><span>{comp.isFree ? 'Free' : `₹${comp.price}`}</span></div>
                      </div>
                      <div className="manage-actions">
                        <button className={`action-btn ${comp.isPriority ? 'active' : ''}`} onClick={() => handleTogglePriority(comp)}><ShieldCheck size={18} /></button>
                        <button className={`action-btn ${comp.isTrending ? 'active' : ''}`} onClick={() => handleToggleTrending(comp)}><Star size={18} /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(comp.id)}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="registrations-view">
            <h2>Student Applications</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead><tr><th>Student</th><th>Competition</th><th>Grade</th><th>WhatsApp</th></tr></thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg.id}>
                      <td><div className="student-cell"><strong>{reg.name}</strong><span>{reg.email}</span></div></td>
                      <td>{reg.competitionId}</td><td>{reg.grade}</td><td>{reg.whatsapp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="admins-management animate-in">
            <div className="admin-grid-layout">
              <div className="admin-form-section">
                <div className="section-header"><h2>Authorize Admin</h2><UserPlus size={20} /></div>
                <form className="admin-form" onSubmit={handleCreateAdmin}>
                  <div className="form-group"><label>Name</label><input type="text" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} required /></div>
                  <div className="form-group"><label>Email</label><input type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} required /></div>
                  <div className="form-group"><label>Password</label><input type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} required /></div>
                  <button type="submit" className="admin-submit-btn" disabled={saving}>Grant Access</button>
                </form>
              </div>
              <div className="admin-list-section">
                <h3>Authorized Personnel</h3>
                <div className="admin-user-list">
                  <div className="admin-user-card super glass-panel"><ShieldAlert size={20} /><div><strong>pa1@skillizee.io</strong><p>System Super Admin</p></div></div>
                  {admins.map(adm => (
                    <div key={adm.id} className="admin-user-card glass-panel"><Users size={20} /><div><strong>{adm.email}</strong><p>{adm.name}</p></div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
