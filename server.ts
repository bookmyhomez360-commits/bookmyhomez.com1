import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_PROPERTIES } from "./src/data/initialProperties.ts";
import { Property } from "./src/types.ts";

let propertiesStore: Property[] = [...INITIAL_PROPERTIES];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "BookMyHomez", timestamp: new Date().toISOString() });
  });

  // Chatbot API Route with exact flow control
  app.post("/api/chat", (req, res) => {
    try {
      const userMessage = (req.body.message || "").toLowerCase().trim();
      
      let reply = "";
      let matchedProperties: Property[] = [];

      // యూజర్ 'hi' లేదా హలో అని చెప్తే కేవలం ఆప్షన్లు మాత్రమే చూపించాలి (ప్రాపర్టీస్ రావు)
      if (userMessage === "hi" || userMessage === "hello" || userMessage === "hey" || userMessage === "start") {
        reply = "Hello! Welcome to Bookmyhomez. Please choose what you are looking for:";
        matchedProperties = [];
      } 
      else if (userMessage.includes("buy") || userMessage.includes("purchase")) {
        reply = "Here are some excellent properties available for Buy:";
        matchedProperties = propertiesStore.filter(p => p.category.toLowerCase() === 'buy');
      } 
      else if (userMessage.includes("rent") || userMessage.includes("lease")) {
        reply = "Here are the available properties for Rent:";
        matchedProperties = propertiesStore.filter(p => p.category.toLowerCase() === 'rent');
      } 
      else if (userMessage.includes("short stay") || userMessage.includes("stay")) {
        reply = "Here are our Short Stay options:";
        matchedProperties = propertiesStore.filter(p => p.category.toLowerCase() === 'short stay' || p.category.toLowerCase() === 'short-stay');
      } 
      else if (userMessage.includes("visit") || userMessage.includes("site")) {
        reply = "Great! Please share your preferred date, time, and city/location so we can schedule your site visit.";
        matchedProperties = [];
      } 
      else {
        // వేరే సిటీ లేదా రిక్వైర్మెంట్ టైప్ చేస్తే వాటికి తగినట్లు ఫిల్టర్ చేయడం
        matchedProperties = propertiesStore.filter(p => 
          p.city.toLowerCase().includes(userMessage) || 
          p.bhk.toLowerCase().includes(userMessage) ||
          p.locality.toLowerCase().includes(userMessage)
        );

        if (matchedProperties.length > 0) {
          reply = `Here are the properties matching your requirement ("${userMessage}"):`;
        } else {
          reply = "I couldn't find an exact match. Please select from Buy, Rent, Short Stay, or Visit a Site.";
          matchedProperties = [];
        }
      }

      res.json({
        success: true,
        reply: reply,
        properties: matchedProperties.slice(0, 4).map(p => ({
          title: p.title,
          image: p.images[0],
          configuration: `${p.bhk} | ${p.city}`,
          price: p.price
        }))
      });
    } catch (err: any) {
      res.status(500).json({ success: false, reply: "Sorry, something went wrong on the server." });
    }
  });

  // GET /api/properties
  app.get("/api/properties", (_req, res) => {
    res.json({ success: true, count: propertiesStore.length, properties: propertiesStore });
  });

  // POST /api/properties
  app.post("/api/properties", (req, res) => {
    try {
      const newProperty: Property = {
        id: req.body.id || Date.now(),
        title: req.body.title || "Untitled Property",
        category: req.body.category || "Buy",
        status: req.body.status || "Available",
        city: req.body.city || "Bengaluru",
        locality: req.body.locality || "Central",
        bhk: req.body.bhk || "2 BHK",
        area: Number(req.body.area) || 1000,
        price: Number(req.body.price) || 0,
        ownerId: req.body.ownerId || "usr_guest",
        ownerName: req.body.ownerName || "Property Owner",
        description: req.body.description || "Property listed via BookMyHomez wizard.",
        images: Array.isArray(req.body.images) && req.body.images.length > 0 
          ? req.body.images 
          : ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80"],
        deposit: req.body.deposit,
        availDate: req.body.availDate,
        propertyAge: req.body.propertyAge,
        bathrooms: req.body.bathrooms,
        balconies: req.body.balconies,
        furnishing: req.body.furnishing,
        furnishings: req.body.furnishings,
        amenities: req.body.amenities,
        propType: req.body.propType,
        subType: req.body.subType,
        createdAt: new Date().toISOString()
      };

      propertiesStore.unshift(newProperty);
      res.status(201).json({ success: true, message: "Property published successfully", property: newProperty });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // PUT /api/properties/:id
  app.put("/api/properties/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = propertiesStore.findIndex(p => p.id === id);
    if (index === -1) {
      res.status(404).json({ success: false, error: "Property not found" });
      return;
    }
    propertiesStore[index] = { ...propertiesStore[index], ...req.body, id };
    res.json({ success: true, message: "Property updated successfully", property: propertiesStore[index] });
  });

  // DELETE /api/properties/:id
  app.delete("/api/properties/:id", (req, res) => {
    const id = Number(req.params.id);
    propertiesStore = propertiesStore.filter(p => p.id !== id);
    res.json({ success: true, message: "Property deleted successfully", id });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BookMyHomez] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
