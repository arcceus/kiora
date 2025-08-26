// MenuOptions.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Palette, 
  Settings, 
  FolderOpen, 
  Heart, 
  Trash2, 
  Download, 
  Share 
} from 'lucide-react';

export const MenuOptions: React.FC = () => {
  const menuItems = [
    { icon: Upload, label: 'Upload', onClick: () => console.log('Upload') },
    { icon: Palette, label: 'Themes', onClick: () => console.log('Themes') },
    { icon: Settings, label: 'Customize', onClick: () => console.log('Customize') },
    { icon: FolderOpen, label: 'Album', onClick: () => console.log('Album') },
    { icon: Heart, label: 'Favourites', onClick: () => console.log('Favourites') },
    { icon: Trash2, label: 'Bin', onClick: () => console.log('Bin') },
    { icon: Download, label: 'Export', onClick: () => console.log('Export') },
    { icon: Share, label: 'Share', onClick: () => console.log('Share') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
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
      className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
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
          className="flex flex-col items-center gap-2 p-4 rounded-xl text-gray-700 hover:text-gray-900 transition-colors duration-200 group"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
            <item.icon className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium">{item.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};
