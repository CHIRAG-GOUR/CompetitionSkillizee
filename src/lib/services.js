import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  addDoc, 
  deleteDoc,
  updateDoc,
  query, 
  where,
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

// Fallback mock data - Empty for Data Optimisation
const MOCK_COMPETITIONS = [];

const MOCK_REGISTRATIONS = [];

export async function getCompetitionById(id) {
  // 1. Check Mock Data
  const mock = MOCK_COMPETITIONS.find(c => c.id === id);
  if (mock) return mock;

  // 2. Check Local Memory (for AI results without Firebase)
  if (typeof window !== 'undefined') {
    const cached = JSON.parse(localStorage.getItem('discovery_cache') || '[]');
    const found = cached.find(c => c.id === id);
    if (found) return found;
  }

  // 3. Check Firestore
  if (!db) return null;
  try {
    const docRef = doc(db, 'competitions', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching competition detail:", error);
    return null;
  }
}

export async function getCompetitions() {
  if (!db) {
    console.log("Using mock competitions data");
    // Sort mock data: Priority items first
    return [...MOCK_COMPETITIONS].sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0));
  }
  
  try {
    // In production Firestore, we sort by isPriority then createdAt
    const q = query(collection(db, 'competitions'), orderBy('isPriority', 'desc'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching competitions: ", error);
    // Sort fallback data
    return [...MOCK_COMPETITIONS].sort((a, b) => (b.isPriority ? 1 : 0) - (a.isPriority ? 1 : 0));
  }
}

export async function getRelatedCompetitions(currentComp, limitCount = 3) {
  if (!db) {
    return MOCK_COMPETITIONS.slice(0, limitCount);
  }
  
  try {
    const q = query(
      collection(db, 'competitions'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const all = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(c => c.id !== currentComp.id);
      
    // Basic recommendation: sort by shared keywords in title/description
    const keywords = currentComp.title.split(' ').concat(currentComp.description.split(' '));
    return all.sort((a, b) => {
      const aMatch = keywords.filter(k => a.title.includes(k)).length;
      const bMatch = keywords.filter(k => b.title.includes(k)).length;
      return bMatch - aMatch;
    }).slice(0, limitCount);
  } catch (error) {
    console.error("Error fetching related competitions: ", error);
    return [];
  }
}

export async function addCompetition(data) {
  if (!db) {
    console.warn("Firebase not connected. Saving to mock (Session only).");
    return null;
  }
  
  try {
    const docRef = await addDoc(collection(db, 'competitions'), {
      ...data,
      isApproved: true,
      isPriority: true,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding competition: ", error);
    throw error;
  }
}

export async function verifyAdmin(email, password) {
  // Default super admin check
  if (email === 'pa1@skillizee.io' && password === '123456') {
    return { email, role: 'super' };
  }

  if (!db) return null;

  try {
    const q = query(
      collection(db, 'admins'),
      where('email', '==', email),
      where('password', '==', password)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    console.error("Admin verification failed:", error);
    return null;
  }
}

export async function createAdmin(adminData) {
  if (!db) return null;
  try {
    const docRef = await addDoc(collection(db, 'admins'), {
      ...adminData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
}

export async function getAdmins() {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, 'admins'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
}

export async function deleteCompetition(id) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'competitions', id));
  } catch (error) {
    console.error("Error deleting competition:", error);
    throw error;
  }
}

export async function updateCompetition(id, updates) {
  if (!db) return;
  try {
    await updateDoc(doc(db, 'competitions', id), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating competition:", error);
    throw error;
  }
}

export async function submitRegistration(competitionId, studentData) {
  if (!db) {
    console.warn("Firebase not connected. Using local check.");
    const localRegs = JSON.parse(localStorage.getItem('mock_registrations') || '[]');
    const isDup = localRegs.some(r => r.competitionId === competitionId && r.email === studentData.email);
    if (isDup) throw new Error('You have already registered for this competition.');
    
    const newReg = { competitionId, ...studentData, id: Date.now().toString() };
    localRegs.push(newReg);
    localStorage.setItem('mock_registrations', JSON.stringify(localRegs));
    return "mock-id";
  }

  try {
    // Check for duplicate
    const q = query(
      collection(db, 'registrations'),
      where('competitionId', '==', competitionId),
      where('email', '==', studentData.email)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('You have already registered for this competition.');
    }

    const docRef = await addDoc(collection(db, 'registrations'), {
      competitionId,
      ...studentData,
      submittedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting registration: ", error);
    throw error;
  }
}

export async function getRegistrations() {
  if (!db) return [];
  
  try {
    const q = query(collection(db, 'registrations'), orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching registrations: ", error);
    return [];
  }
}
