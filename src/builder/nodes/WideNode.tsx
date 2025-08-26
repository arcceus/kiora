import React, { memo } from 'react';

const WideNode: React.FC = () => {
  return (
    <div className="w-full h-full bg-black-900 border border-black-700 rounded-lg flex items-center justify-center text-black-300">
      16:9
    </div>
  );
};

export default memo(WideNode);


