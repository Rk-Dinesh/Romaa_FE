import { motion } from "framer-motion";
import { RiDeleteBin5Fill } from "react-icons/ri";

const TrashToast = ({ onUndo, closeToast }) => {
  return (
    <div className="flex items-center gap-4 justify-center">
      {/* Falling item */}
       <motion.div
        initial={{ y: -100, x: 0, rotate: -15, opacity: 0 }}
        animate={{
          y: [ -100, 0, 25, 40, 50 ],   // falling down
          x: [ 0, 5, 10, 15, 15 ],       // slight horizontal drift
          rotate: [-15, -5, 0, 5, 0],    // wobble
          opacity: [0, 1, 1, 1, 0],      // disappear inside bin
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="w-6 h-6 bg-blue-500 rounded-sm shadow-md pointer-events-auto"
      />

      {/* Trash Bin (icon as motion) */}
      <div className="relative w-12 h-14 flex justify-center items-end">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }} // bounce on impact
          transition={{ delay: 1.2, duration: 0.4, ease: "easeOut" }}
        >
          <RiDeleteBin5Fill className="text-red-500 w-12 h-14 drop-shadow-md" />
        </motion.div>

        {/* Lid (animated open/close) */}
        {/* <motion.div
          className="absolute -top-2 left-1 w-10 h-2 bg-red-700 rounded-t origin-left"
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -45, 0] }}
          transition={{
            duration: 1.4,
            ease: "easeInOut",
          }}
        /> */}
        
        {/* Dust puff */}
        <motion.div
          className="absolute bottom-2 left-1/2 w-2 h-2 bg-gray-400 rounded-full"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: [0.2, 1.5, 2], opacity: [0, 0.7, 0] }}
          transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
        />
        <motion.div
          className="absolute bottom-2 left-1/2 w-2 h-2 bg-gray-300 rounded-full"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: [0.2, 1.2, 1.8], opacity: [0, 0.6, 0] }}
          transition={{ delay: 1.25, duration: 0.7, ease: "easeOut" }}
        />
      </div>

      {/* Text */}
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        User deleted
      </motion.span>

      {/* Undo button */}
      <motion.button
        onClick={() => {
          onUndo();
          closeToast();
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="ml-4 text-blue-400 hover:text-blue-600 underline"
      >
        Undo
      </motion.button>
    </div>
  );
};

export default TrashToast;
