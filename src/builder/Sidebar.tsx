import React from 'react';
import { useDnD } from './DnDContext';

const Sidebar: React.FC = () => {
  const [_, setType] = useDnD();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    setType(nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const entry = (label: string, type: string, desc?: string) => (
    <div className="p-3 rounded-lg border border-black-700 bg-black-900 hover:bg-black-800 cursor-grab select-none" onDragStart={(e) => onDragStart(e, type)} draggable>
      <div className="text-sm font-medium text-white">{label}</div>
      {desc && <div className="text-xs text-black-300">{desc}</div>}
    </div>
  );

  return (
    <aside className="w-64 p-4 space-y-3 border-l border-black-700 bg-black-950">
      <div className="text-xs uppercase tracking-wide text-black-300">Shapes</div>
      {entry('Square 1:1', 'square-1-1', 'Profile / IG')}
      {entry('Landscape 4:3', 'landscape-4-3', 'Standard')}
      {entry('Portrait 3:4', 'portrait-3-4', 'Phone / Stories')}
      {entry('Wide 16:9', 'wide-16-9', 'Panoramic')}
    </aside>
  );
};

export default Sidebar;


