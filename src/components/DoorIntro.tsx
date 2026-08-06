"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function DoorIntro() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);

    setTimeout(() => {
      // Navigate to Home Page
      window.location.href = "/";
      // If using NextJS App Router:
      // router.push("/")
    }, 1800);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black z-[9999]">

      {/* Left Door */}
      <motion.div
        animate={{
          x: open ? "-100%" : "0%",
        }}
        transition={{
          duration: 1.6,
          ease: [0.65, 0, 0.35, 1],
        }}
        className="absolute left-0 top-0 w-1/2 h-full"
        style={{
          backgroundImage: "url('/door-left.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Right Door */}
      <motion.div
        animate={{
          x: open ? "100%" : "0%",
        }}
        transition={{
          duration: 1.6,
          ease: [0.65, 0, 0.35, 1],
        }}
        className="absolute right-0 top-0 w-1/2 h-full"
        style={{
          backgroundImage: "url('/door-right.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Key */}
      <motion.div
        whileHover={{
          scale: 1.08,
        }}
        whileTap={{
          scale: 0.92,
          rotate: 25,
        }}
        animate={{
          opacity: open ? 0 : 1,
          scale: open ? 0.5 : 1,
        }}
        transition={{
          duration: 0.4,
        }}
        onClick={handleOpen}
        className="absolute inset-0 flex items-center justify-center cursor-pointer select-none"
      >
        <img
          src="/gold-key.png"
          className="w-[300px] md:w-[450px]"
          alt="Key"
        />
      </motion.div>

      {/* Text */}
      {!open && (
        <div className="absolute bottom-16 w-full text-center">
          <h1 className="text-yellow-300 text-2xl md:text-5xl font-bold tracking-widest">
            TAP ON KEY
          </h1>
        </div>
      )}

    </div>
  );
}
