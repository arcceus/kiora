import React, { createContext, useContext, useState } from 'react';

type NodeType = string | null;

const DnDContext = createContext<[NodeType, (t: NodeType) => void]>([null, () => {}]);

export const DnDProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [type, setType] = useState<NodeType>(null);

  return (
    <DnDContext.Provider value={[type, setType]}>
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

export const useDnD = () => useContext(DnDContext);


