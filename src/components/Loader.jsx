import { useState, useEffect } from "react";

const MESSAGES = [
  "Loading project data...",
  "Fetching site reports...",
  "Syncing tender records...",
  "Preparing your workspace...",
];

const Loader = ({ fullScreen = true, message }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, [message]);

  const displayMessage = message ?? MESSAGES[msgIndex];

  const content = (
    <div className="flex flex-col items-center gap-8">

      {/* Logo mark */}
      <div className="flex flex-col items-center gap-1 select-none">
        <span className="text-2xl font-black tracking-[0.25em] text-darkest-blue dark:text-white uppercase">
          ROMAA
        </span>
        <span className="text-[10px] font-medium tracking-[0.3em] text-gray-400 dark:text-gray-500 uppercase">
          Construction ERP
        </span>
      </div>

      {/* Spinner */}
      <div className="relative w-14 h-14">
        {/* Static background ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 dark:border-gray-800" />
        {/* Spinning arc — primary */}
        <div
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-darkest-blue dark:border-t-blue-400 animate-spin"
          style={{ animationDuration: "0.9s" }}
        />
        {/* Spinning arc — secondary (counter, slower) */}
        <div
          className="absolute inset-[6px] rounded-full border-[2px] border-transparent border-b-blue-300 dark:border-b-blue-600 animate-spin"
          style={{ animationDuration: "1.4s", animationDirection: "reverse" }}
        />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-darkest-blue dark:bg-blue-400 animate-pulse" />
        </div>
      </div>

      {/* Indeterminate progress bar */}
      <div className="w-52 h-[2px] bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full w-2/5 bg-darkest-blue dark:bg-blue-400 rounded-full"
          style={{ animation: "loader-slide 1.8s ease-in-out infinite" }}
        />
      </div>

      {/* Status message */}
      <p
        className="text-sm text-gray-500 dark:text-gray-400 tracking-wide transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {displayMessage}
      </p>

      <style>{`
        @keyframes loader-slide {
          0%   { transform: translateX(-150%); }
          100% { transform: translateX(380%); }
        }
      `}</style>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm z-50 font-roboto-flex">
      {content}
    </div>
  );
};

export default Loader;
