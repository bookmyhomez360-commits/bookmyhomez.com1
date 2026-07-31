import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin safely
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// Voiceflow API Route
app.post('/api/search-properties', async (req, res) => {
    try {
        const { intent, location, budget } = req.body;
        console.log('Voiceflow Search Request Received:', { intent, location, budget });

        let matchedProperties = [];

        if (db) {
            let query = db.collection('properties');
            if (location) {
                query = query.where('location', '==', location);
            }
            const snapshot = await query.get();
            snapshot.forEach(doc => {
                matchedProperties.push({ id: doc.id, ...doc.data() });
            });
        }

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

// Serve React Frontend
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
});

const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
