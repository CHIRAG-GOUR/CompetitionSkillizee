import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req) {
  try {
    const { query: userQuery, isAutoResearch = false } = await req.json();

    if (!userQuery) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    console.log(`[Discovery Engine] Query: "${userQuery}" | Auto: ${isAutoResearch}`);

    const isZapFetch = userQuery.includes('Analyze competition at');

    const prompt = isZapFetch
      ? `You are a Competition Intelligence Agent. Analyze this URL and extract competition details:
         URL: ${userQuery.replace('Analyze competition at ', '')}
         Return a JSON array with ONE object containing: title, organizer, description, detailedDescription, imageUrl, price, location, mode, registrationDate, submissionDate, registrationLink, eligibility, prizes, howToWin (array of {phase, advice, secret_tip}), verification ({source_site, trust_score}).
         OUTPUT: Return ONLY a valid JSON array. No markdown, no explanation.`
      : `You are a Competition Discovery Agent. Search the web RIGHT NOW for real, active competitions.

         SEARCH QUERY: "${userQuery}"
         
         Find 8-10 REAL competitions that are currently accepting registrations or will open in 2025-2026.
         
         IMPORTANT SEARCH TARGETS:
         - Pitch Karo India
         - ATL Marathon / Atal Tinkering Labs
         - Inspire Award MANAK
         - Tinkerpreneur
         - Diamond Challenge
         - TiE Young Entrepreneurs
         - Wharton Global High School Investment Competition
         - Google Code to Learn
         - NASA Space Apps Challenge
         - National Science Olympiad
         - SOF (Science Olympiad Foundation) exams
         - CBSE National Level competitions
         - Young Innovators Programme
         - iStart Rajasthan
         
         For EACH competition found, return:
         {
           "title": "exact name",
           "organizer": "who runs it",
           "description": "one line summary",
           "detailedDescription": "2-3 sentence detailed description",
           "imageUrl": "https://images.unsplash.com/photo-RELEVANT?w=800&q=80",
           "price": number (0 if free, else INR amount),
           "location": "city or Online or National",
           "mode": "Online/Offline/Hybrid",
           "registrationDate": "when registration opens/closes",
           "submissionDate": "submission deadline",
           "registrationLink": "actual official URL",
           "eligibility": "who can participate",
           "prizes": "what winners get",
           "howToWin": [
             {"phase": "Phase 1", "advice": "practical advice", "secret_tip": "insider tip"},
             {"phase": "Phase 2", "advice": "practical advice", "secret_tip": "insider tip"},
             {"phase": "Phase 3", "advice": "practical advice", "secret_tip": "insider tip"}
           ],
           "verification": {"source_site": "official website domain", "trust_score": 85-100}
         }

         RULES:
         1. Use REAL data from your search results. Include REAL URLs.
         2. Each competition must be unique - no duplicates.
         3. Focus on K-12 / school student level competitions in India.
         4. Include a mix of STEM, Business, Arts, and Innovation categories.
         
         OUTPUT: Return ONLY a valid JSON array. No markdown code fences, no explanation text.`;

    let competitions = [];
    
    try {
      console.log("[Discovery Engine] Calling Gemini with Google Search grounding...");
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        },
      });

      const text = response.text;
      
      console.log("[Discovery Engine] Response length:", text?.length || 0);
      console.log("[Discovery Engine] First 300 chars:", text?.substring(0, 300));

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      // Try to extract JSON array from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        competitions = JSON.parse(jsonMatch[0]);
        console.log(`[Discovery Engine] SUCCESS: Parsed ${competitions.length} competitions`);
      } else {
        console.error("[Discovery Engine] No JSON array in response. Full text:", text.substring(0, 500));
        throw new Error("No JSON array found in AI response");
      }
    } catch (aiError) {
      console.error("[Discovery Engine] FAILED:", aiError.message);
      
      // If Google Search grounding failed, try without it as fallback
      try {
        console.log("[Discovery Engine] Retrying WITHOUT Google Search tool...");
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            temperature: 0.9,
          },
        });
        
        const fallbackText = fallbackResponse.text;
        console.log("[Discovery Engine] Fallback response length:", fallbackText?.length || 0);
        
        const jsonMatch = fallbackText?.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          competitions = JSON.parse(jsonMatch[0]);
          console.log(`[Discovery Engine] Fallback SUCCESS: Parsed ${competitions.length} competitions`);
        } else {
          throw new Error("Fallback also failed to return JSON");
        }
      } catch (fallbackError) {
        console.error("[Discovery Engine] Fallback also FAILED:", fallbackError.message);
        // Return empty so the frontend knows nothing was found
        return NextResponse.json({ error: "Discovery engine temporarily unavailable", details: fallbackError.message }, { status: 503 });
      }
    }

    // Map to our internal ID format
    const formatted = competitions.map(c => ({
      ...c,
      id: `live-${Math.random().toString(36).substr(2, 9)}`,
      isFree: c.price === 0 || c.price === '0' || !c.price,
      isLiveResult: true,
      sourceSite: c.verification?.source_site || c.organizer || 'Official Portal',
      trustScore: c.verification?.trust_score || 95,
      createdAt: new Date().toISOString()
    }));

    // BACKGROUND TASK: Save to Firebase if configured
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, getDocs, query, where } = await import('firebase/firestore');

      if (db) {
        for (const comp of formatted) {
          const q = query(collection(db, 'competitions'), where('title', '==', comp.title));
          const snapshot = await getDocs(q);

          if (snapshot.empty) {
            await addDoc(collection(db, 'competitions'), {
              ...comp,
              isApproved: false,
              isPriority: false,
              createdAt: new Date().toISOString()
            });
            console.log(`[Discovery Engine] Saved to DB: ${comp.title}`);
          }
        }
      }
    } catch (saveError) {
      // Non-critical - Firebase not configured is OK
    }

    console.log(`[Discovery Engine] Returning ${formatted.length} competitions to frontend`);
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[Discovery Engine] Fatal Error:", error.message || error);
    return NextResponse.json({
      error: "Search service unavailable",
      details: error.message
    }, { status: 500 });
  }
}
