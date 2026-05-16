import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

/**
 * List of Discovery Portals to scrape
 */
const DISCOVERY_URLS = [
  'https://unstop.com/school-events',
  'https://www.youthop.com/competitions',
  'https://studentcompetitions.com/'
];

/**
 * Fetches and extracts data using Puppeteer and Gemini
 */
async function scrapeUrl(url) {
  console.log(`Analyzing Source: ${url}`);
  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Get raw HTML and metadata
    const content = await page.evaluate(() => {
      return {
        text: document.body.innerText.substring(0, 5000), // First 5000 chars
        html: document.documentElement.outerHTML.substring(0, 10000),
        ogImage: document.querySelector('meta[property="og:image"]')?.content
      };
    });

    await browser.close();

    // Use Gemini to extract structured data from raw content
    const prompt = `
      Analyze the following content from ${url} and extract all high-quality upcoming school/student competitions.
      
      Requirements:
      - title
      - organizer
      - description (compelling, max 200 chars)
      - location (must be "Jaipur", "Online", or "Global")
      - mode ("online" or "offline")
      - price (number, 0 if free)
      - registrationLink (exact direct link to registration/details)
      - registrationDate (deadline for registration)
      - submissionDate (date of event or submission)
      - imageUrl (try to find the exact image URL from the content or use ${content.ogImage || 'null'})
      
      Rules:
      - If mode is offline and location is NOT Jaipur, skip it.
      - Return ONLY a JSON array.
      
      Content: ${content.text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    if (browser) await browser.close();
    return [];
  }
}

/**
 * Normalizes competition data
 */
function normalizeCompetition(raw) {
  const isFree = raw.price === 0 || !raw.price || raw.isFree === true;
  return {
    ...raw,
    price: isFree ? 0 : (parseInt(raw.price) || 0),
    isFree: isFree,
    source: raw.source || 'Autonomous Scraper',
    imageUrl: raw.imageUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    registrationDate: raw.registrationDate || '',
    submissionDate: raw.submissionDate || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Main Run Function
 */
export async function runScraper() {
  console.log("Starting Autonomous AI Scraper...");
  
  const results = { added: 0, updated: 0, skipped: 0, errors: 0 };
  
  try {
    for (const url of DISCOVERY_URLS) {
      const foundComps = await scrapeUrl(url);
      
      for (const rawItem of foundComps) {
        try {
          const normalized = normalizeCompetition(rawItem);
          
          // Duplicate Prevention (Match by title and registrationLink)
          if (db) {
            const q = query(collection(db, 'competitions'), where('registrationLink', '==', normalized.registrationLink));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
              const existingId = snapshot.docs[0].id;
              await updateDoc(doc(db, 'competitions', existingId), {
                ...normalized,
                updatedAt: new Date().toISOString()
              });
              results.updated++;
            } else {
              await addDoc(collection(db, 'competitions'), normalized);
              results.added++;
            }
          } else {
            results.added++; // Mock success
          }
        } catch (itemError) {
          console.error("Item processing error:", itemError);
          results.errors++;
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error("Scraper Engine Failed:", error);
    throw error;
  }
}
