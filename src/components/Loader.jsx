import React, { useState, useEffect } from "react";
import {
  FaHammer,
  FaHardHat,
  FaTools,
  FaTruck,
  FaWrench,
  FaToolbox,
} from "react-icons/fa";
import { GiCrane, GiBarricade } from "react-icons/gi";

const chainItems = [
  { icon: <FaHardHat />, color: "text-yellow-400" },
  { icon: <GiCrane />, color: "text-yellow-500" },
  { icon: <FaHammer />, color: "text-red-600" },
  { icon: <FaWrench />, color: "text-yellow-600" },
  { icon: <FaTools />, color: "text-gray-600" },
  { icon: <FaToolbox />, color: "text-yellow-700" },
  { icon: <FaTruck />, color: "text-orange-400" },
  { icon: <GiBarricade />, color: "text-red-500" },
];

const slogans = [
  "Laying the foundation…",
  "Operating the crane…",
  "Hammering things into place…",
  "Assembling the structure…",
  "Securing the site…",
  "Building with precision…",
  "Transporting materials…",
  "Final touches underway…",
];

const Loader = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSlogan, setCurrentSlogan] = useState(slogans[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % chainItems.length;
        setCurrentSlogan(slogans[next]);
        return next;
      });
    }, 1200); // change icon & slogan every 1.2s

    return () => clearInterval(interval);
  }, []);

  const currentItem = chainItems[currentIndex];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-black/80 z-10">
      <div className={`text-6xl animate-bounce ${currentItem.color}`}>
        {currentItem.icon}
      </div>
      <p className="mt-6 text-xl font-bold text-darkest-blue dark:text-white text-center max-w-xs">
        {currentSlogan}
      </p>
    </div>
  );
};

export default Loader;
