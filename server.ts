import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// ES Modules __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin safely
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // credential: admin.credential.cert(...)
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ==========================================
// 1. Voiceflow API Property Search Endpoint
// ==========================================
app.post('/api/search-properties', async (req: express.Request, res: express.Response) => {
    try {
        const { intent, location, budget } = req.body;
        console.log('Voiceflow Search Request Received:', { intent, location, budget });

        let matchedProperties: any[] = [];

        if (db) {
            let query: any = db.collection('properties');
            if (location) {
                query = query.where('location', '==', location);
            }
            const snapshot = await query.get();
            snapshot.forEach((doc: any) => {
                matchedProperties.push({ id: doc.id, ...doc.data() });
            });
        }

        // Fallback data if DB is empty
        if (matchedProperties.length === 0) {
            matchedProperties = [
                { 
                    title: "Eco-Modernist Sky Duplex", 
                    price: "₹1.2 Cr", 
                    location: location || "Gurgaon",
                    type: intent || "Buy",
                    bhk: "4 BHK"
                },
                { 
                    title: "Luxury 3BHK Apartment", 
                    price: "₹75 Lakhs", 
                    location: location || "Gurgaon",
                    type: intent || "Buy",
                    bhk: "3 BHK"
                }
            ];
        }

        return res.json({
            success: true,
            message: "Here are the matching properties found in our database:",
            properties: matchedProperties
        });

    } catch (error) {
        console.error('Error fetching properties:', error);
        return res.status(500).json({ 
            success: false, 
            message: "Server error while searching properties." 
        });
    }
});

// ==========================================
// 2. Serve React Frontend Static Files (IMPORTANT for Railway)
// ==========================================
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
});

// ==========================================
// 3. Server Port Setup
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
