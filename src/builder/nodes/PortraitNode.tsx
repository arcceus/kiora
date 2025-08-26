import React, { memo } from 'react';

const PortraitNode: React.FC = () => {
  return (
    <div className="w-full h-full bg-black-900 border border-black-700 rounded-lg flex items-center justify-center text-black-300">
      3:4
    </div>
  );
};

export default memo(PortraitNode);


