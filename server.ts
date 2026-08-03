import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_PROPERTIES } from "./src/data/initialProperties.ts";
import { Property } from "./src/types.ts";

let propertiesStore: Property[] = [...INITIAL_PROPERTIES];

// యూజర్ల చాట్ సెషన్స్ మరియు కలెక్ట్ చేసిన వివరాలు స్టోర్ చేయడానికి (In-memory session storage)
const userSessions: { [key: string]: { step: string; category?: string; location?: string; bhk?: string; budget?: string; name?: string; phone?: string; visitProperty?: string; visitDate?: string } } = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "BookMyHomez", timestamp: new Date().toISOString() });
  });

  // Intelligent Real Estate AI Assistant Chat Route
  app.post("/api/chat", (req, res) => {
    try {
      const userMessage = (req.body.message || "").trim();
      const lowerMsg = userMessage.toLowerCase();
      
      // సెషన్ ఐడి కోసం సింపుల్ గా ఐపీ లేదా ఒక జనరల్ కీ వాడదాం (లేదా ఫ్రంట్ ఎండ్ నుండి వచ్చే ఐడీ)
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
          session.step = "BUY_RENT_LOCATION";
          reply = "🏠 Great! You want to **Buy** a property.\n\nStep 1/4: Please enter your target **Location** or City (e.g., Mumbai, Hyderabad, Bengaluru, Gurgaon):";
        } else if (lowerMsg.includes("rent") || lowerMsg === "2") {
          session.category = "Rent";
          session.step = "BUY_RENT_LOCATION";
          reply = "🏢 Great! You want to **Rent** a property.\n\nStep 1/4: Please enter your target **Location** or City (e.g., Mumbai, Hyderabad, Bengaluru, Gurgaon):";
        } else if (lowerMsg.includes("property visit") || lowerMsg === "3" || lowerMsg.includes("visit")) {
          session.step = "VISIT_PROPERTY";
          reply = "📅 Let's schedule a **Property Visit**.\n\nStep 1/3: Which property or Location/Project name would you like to visit?";
        } else if (lowerMsg.includes("visit site") || lowerMsg === "4") {
          session.step = "SELECT_OPTION";
          reply = "🌐 You can explore our main website here: [https://www.bookmyhomez.com](https://www.bookmyhomez.com).\n\nHere you will find full galleries, interactive maps, and virtual tours! Do you need help finding anything specific? (Type 'Hi' to start over)";
        } else {
          reply = "⚠️ Please choose a valid option by typing: **Buy**, **Rent**, **Property Visit**, or **Visit Site**.";
        }
      }
      // --- OPTION A FLOW: BUY / RENT ---
      else if (session.step === "BUY_RENT_LOCATION") {
        session.location = userMessage;
        session.step = "BUY_RENT_BHK";
        reply = `📍 Location noted: **${session.location}**.\n\nStep 2/4: What is your preferred Property Type / BHK? (e.g., 1BHK, 2BHK, 3BHK, Villa, Plot):`;
      }
      else if (session.step === "BUY_RENT_BHK") {
        session.bhk = userMessage;
        session.step = "BUY_RENT_BUDGET";
        reply = `🛏️ Configuration noted: **${session.bhk}**.\n\nStep 3/4: What is your expected **Budget range**? (e.g., 50 Lakhs, 2 Crores, or 30k/month):`;
      }
      else if (session.step === "BUY_RENT_BUDGET") {
        session.budget = userMessage;
        session.step = "BUY_RENT_CONTACT";
        reply = `💰 Budget noted: **${session.budget}**.\n\nStep 4/4: Please share your **Full Name** so our team can connect with you:`;
      }
      else if (session.step === "BUY_RENT_CONTACT") {
        session.name = userMessage;
        session.step = "BUY_RENT_PHONE";
        reply = `👤 Thanks, **${session.name}**!\n\nFinally, please share your **Phone Number** to receive matching properties and exclusive details:`;
      }
      else if (session.step === "BUY_RENT_PHONE") {
        session.phone = userMessage;
        
        // Website API Search using collected filters
        matchedProperties = propertiesStore.filter(p => 
          (session.category ? p.category.toLowerCase() === session.category.toLowerCase() : true) &&
          (session.location ? p.city.toLowerCase().includes(session.location.toLowerCase()) || p.locality.toLowerCase().includes(session.location.toLowerCase()) : true) &&
          (session.bhk ? p.bhk.toLowerCase().includes(session.bhk.toLowerCase()) : true)
        );

        if (matchedProperties.length === 0) {
          // ఒకవేళ ఎగ్జాక్ట్ మ్యాచ్ కాకపోతే కేటగిరీ బేస్ చేసి కొన్ని చూపించడం
          matchedProperties = propertiesStore.filter(p => session.category ? p.category.toLowerCase() === session.category.toLowerCase() : true).slice(0, 3);
        }

        if (matchedProperties.length > 0) {
          reply = `✅ Thank you! We have saved your details. Here are the matching properties for your ${session.category} request in **${session.location}**:`;
        } else {
          reply = `ℹ️ Currently, no exact matches are available for your criteria, but our team will curate options for you soon and reach out at **${session.phone}**! Here are some of our featured properties:`;
          matchedProperties = propertiesStore.slice(0, 3);
        }

        // రిసెట్ సెషన్
        session.step = "SELECT_OPTION";
      }
      // --- OPTION B FLOW: PROPERTY VISIT ---
      else if (session.step === "VISIT_PROPERTY") {
        session.visitProperty = userMessage;
        session.step = "VISIT_DATE";
        reply = `🏢 Property/Location: **${session.visitProperty}**.\n\nStep 2/3: What is your **Preferred Date & Time** for the visit?`;
      }
      else if (session.step === "VISIT_DATE") {
        session.visitDate = userMessage;
        session.step = "VISIT_NAME";
        reply = `📅 Preferred Time: **${session.visitDate}**.\n\nStep 3/3: Please enter your **Full Name**:`;
      }
      else if (session.step === "VISIT_NAME") {
        session.name = userMessage;
        session.step = "VISIT_PHONE";
        reply = `👤 Thank you, **${session.name}**. Please provide your **Phone Number** to confirm the booking:`;
      }
      else if (session.step === "VISIT_PHONE") {
        session.phone = userMessage;
        session.step = "SELECT_OPTION";
        reply = `🎉 **Appointment Confirmed!**\n\nYour site visit for **${session.visitProperty}** is scheduled on **${session.visitDate}**. Our executive will reach out to you shortly at **${session.phone}**.\n\nType **'Hi'** if you want to explore more properties!`;
      }
      else {
        session.step = "SELECT_OPTION";
        reply = "I'm here to help! Let's start over. Type **'Hi'** to view the main options.";
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
