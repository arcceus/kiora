import React, { memo } from 'react';

const SquareNode: React.FC<{ data?: unknown } & React.HTMLAttributes<HTMLDivElement>> = () => {
  return (
    <div className="w-full h-full bg-black-900 border border-black-700 rounded-lg flex items-center justify-center text-black-300">
      1:1
    </div>
  );
};

export default memo(SquareNode);


