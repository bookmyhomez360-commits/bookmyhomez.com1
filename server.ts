import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (Me project lo unna firebase config batti initialize avtundi)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // credential: admin.credential.cert(...) // service account unte ikkada ivvandi, leda default ga work avtundi
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

// ==========================================
// Voiceflow Property Search API Endpoint
// ==========================================
app.post('/api/search-properties', async (req, res) => {
    try {
        const { intent, location, budget } = req.body;
        console.log('Voiceflow Search Request Received:', { intent, location, budget });

        let matchedProperties = [];

        // 1. Firebase Database nundi data fetch cheyadam
        if (db) {
            let query = db.collection('properties');
            
            if (location) {
                // Location match ayye properties filter cheyachu
                query = query.where('location', '==', location);
            }
            
            const snapshot = await query.get();
            snapshot.forEach(doc => {
                matchedProperties.push({ id: doc.id, ...doc.data() });
            });
        }

        // 2. Database lo properties lekunte fallback data (Testing kosam)
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

        // 3. Voiceflow ki JSON response pampadam
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

// Server Port Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
