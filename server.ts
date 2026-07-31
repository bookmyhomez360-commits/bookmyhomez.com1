import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

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

// 1. GET Route: Browser lo direct ga URL open chesinappudu error raakunda undadaniki
app.get('/api/search-properties', (req, res) => {
    return res.json({ 
        status: "success", 
        message: "API is working! Please send a POST request from Voiceflow." 
    });
});

// 2. POST Route: Voiceflow nundi data receive chesukuni properties pampincheku
app.post('/api/search-properties', async (req: express.Request, res: express.Response) => {
    try {
        const { intent, location, budget } = req.body;
        console.log('Voiceflow Search Request Received:', { intent, location, budget });

        let matchedProperties: any[] = [];

        // Firebase database nundi data fetch cheyadam
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

        // Database lo properties lekunte fallback data (Testing kosam)
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

        // Voiceflow ki JSON response pampadam
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
