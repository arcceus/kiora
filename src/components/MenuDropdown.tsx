// MenuDropdown.tsx
import React from 'react';
import { motion } from 'framer-motion';

const MenuDropdown: React.FC = () => {
  const menuItems = [
    { label: 'Themes', onClick: () => console.log('Themes') },
    { label: 'Favourites', onClick: () => console.log('Favourites') },
    { label: 'Bin', onClick: () => console.log('Bin') },
    { label: 'Export', onClick: () => console.log('Export') },
    { label: 'Share', onClick: () => console.log('Share') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex justify-center gap-8 max-w-4xl mx-auto px-6"
    >
      {menuItems.map((item, index) => (
        <motion.button
          key={index}
          variants={itemVariants}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: "rgba(0, 0, 0, 0.05)" 
          }}
          whileTap={{ scale: 0.95 }}
          onClick={item.onClick}
          className="px-6 py-3 rounded-lg text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
        >
          {item.label}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default MenuDropdown;
