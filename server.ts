import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_PROPERTIES } from "./src/data/initialProperties.ts";
import { Property } from "./src/types.ts";

let propertiesStore: Property[] = [...INITIAL_PROPERTIES];

// యూజర్ల చాట్ సెషన్స్
const userSessions: { [key: string]: { step: string; category?: string; location?: string; bhk?: string; budget?: string; name?: string; phone?: string; visitProperty?: string; visitDate?: string } } = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "BookMyHomez", timestamp: new Date().toISOString() });
  });

  // Smart AI Agent Chat Route
  app.post("/api/chat", (req, res) => {
    try {
      const userMessage = (req.body.message || "").trim();
      const lowerMsg = userMessage.toLowerCase();
      
      const sessionId = req.body.sessionId || "default_user";
      if (!userSessions[sessionId]) {
        userSessions[sessionId] = { step: "INIT" };
      }
      const session = userSessions[sessionId];

      let reply = "";
      let matchedProperties: Property[] = [];

      // 1. GREETING & INITIAL OPTIONS
      if (lowerMsg === "hi" || lowerMsg === "hello" || lowerMsg === "hey" || lowerMsg === "start" || session.step === "INIT") {
        session.step = "SELECT_OPTION";
        reply = "👋 Hello! Welcome to **BookMyHomez**. I'm your intelligent Real Estate AI Assistant. How can I help you today? Please choose one of the options below:\n\n1️⃣ **Buy**\n2️⃣ **Rent**\n3️⃣ **Property Visit**\n4️⃣ **Visit Site**";
      } 
      else if (session.step === "SELECT_OPTION") {
        if (lowerMsg.includes("buy") || lowerMsg === "1") {
          session.category = "Buy";
          session.step = "COLLECT_DETAILS";
          reply = "🏠 Great! You want to **Buy** a property.\n\nPlease tell me your requirements (e.g., City/Location, BHK like 2BHK, and Budget):";
        } else if (lowerMsg.includes("rent") || lowerMsg === "2") {
          session.category = "Rent";
          session.step = "COLLECT_DETAILS";
          reply = "🏢 Great! You want to **Rent** a property.\n\nPlease tell me your requirements (e.g., City/Location, BHK like 2BHK, and Budget):";
        } else if (lowerMsg.includes("property visit") || lowerMsg === "3" || lowerMsg.includes("visit")) {
          session.step = "VISIT_PROPERTY";
          reply = "📅 Let's schedule a **Property Visit**.\n\nWhich property or Location/Project name would you like to visit?";
        } else if (lowerMsg.includes("visit site") || lowerMsg === "4") {
          session.step = "SELECT_OPTION";
          reply = "🌐 You can explore our main website here: [https://www.bookmyhomez.com](https://www.bookmyhomez.com).\n\nDo you need help finding anything specific? (Type 'Hi' to start over)";
        } else {
          // ఒకవేళ ఆప్షన్ సెలెక్ట్ చేయకుండా నేరుగా ఏదైనా టైప్ చేసినా ఏజెంట్ లాగా అర్థం చేసుకోవడం
          session.step = "COLLECT_DETAILS";
          // ఇక్కడే కింది లాజిక్ కి పాస్ అవుతుంది
        }
      }

      // 2. SMART AI AGENT - SINGLE/MULTI DETAIL EXTRACTION
      if (session.step === "COLLECT_DETAILS" || session.step.startsWith("BUY_RENT_")) {
        // యూజర్ ఇచ్చిన మెసేజ్ లో ఉన్న కీవర్డ్స్ బట్టి లొకేషన్ లేదా BHK ని ఆటోమేటిక్ గా గుర్తించడం
        if (!session.location) {
          session.location = userMessage;
        } else if (!session.bhk) {
          session.bhk = userMessage;
        } else if (!session.budget) {
          session.budget = userMessage;
        } else if (!session.name) {
          session.name = userMessage;
        } else if (!session.phone) {
          session.phone = userMessage;
        }

        // ఒకవేళ యూజర్ అన్నీ ఒకేసారి ఇచ్చినా లేదా విడివిడిగా ఇచ్చినా సర్చ్ చేయడం
        matchedProperties = propertiesStore.filter(p => {
          const matchCat = session.category ? p.category.toLowerCase() === session.category.toLowerCase() : true;
          const matchLoc = session.location ? (p.city.toLowerCase().includes(userMessage.toLowerCase()) || p.locality.toLowerCase().includes(userMessage.toLowerCase()) || p.title.toLowerCase().includes(userMessage.toLowerCase())) : true;
          const matchBhk = session.bhk ? p.bhk.toLowerCase().includes(userMessage.toLowerCase()) : true;
          return matchCat && (matchLoc || matchBhk);
        });

        if (matchedProperties.length > 0) {
          reply = `✨ Here are the best properties matching your requirement:`;
          session.step = "SELECT_OPTION"; // రీసెట్
        } else {
          // డేటాబేస్ లో ఎగ్జాక్ట్ మ్యాచ్ కాకపోతే కేటగిరీ బేస్ చేసి బెస్ట్ ప్రాపర్టీస్ చూపించడం
          matchedProperties = propertiesStore.filter(p => session.category ? p.category.toLowerCase() === session.category.toLowerCase() : true).slice(0, 3);
          reply = `🔍 Based on your preferences, here are our recommended properties for you:`;
          session.step = "SELECT_OPTION";
        }
      }
      // --- OPTION B FLOW: PROPERTY VISIT ---
      else if (session.step === "VISIT_PROPERTY") {
        session.visitProperty = userMessage;
        session.step = "VISIT_DATE";
        reply = `📅 Preferred Property: **${session.visitProperty}**.\n\nPlease share your **Preferred Date & Time** and your **Phone Number**:`;
      }
      else if (session.step === "VISIT_DATE") {
        session.phone = userMessage;
        session.step = "SELECT_OPTION";
        reply = `🎉 **Appointment Confirmed!**\n\nYour site visit for **${session.visitProperty}** is successfully scheduled. Our executive will reach out to you shortly.\n\nType **'Hi'** to explore more properties!`;
      }

      res.json({
        success: true,
        reply: reply,
        properties: matchedProperties.slice(0, 4).map(p => ({
          title: p.title,
          image: p.images[0],
          configuration: `${p.bhk} | ${p.city} - ₹${p.price}`,
          price: p.price,
          link: `https://www.bookmyhomez.com`
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
