import { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  badge?: string | number;
  className?: string;
}

function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
  badge,
  className = '',
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`border-t pt-4 ${className}`}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-100 rounded p-1 -m-1"
      >
        <span className="text-gray-400 text-xs">{expanded ? '▼' : '▶'}</span>
        <label className="text-xs text-gray-500 font-semibold cursor-pointer">
          {title}
        </label>
        {badge !== undefined && (
          <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
            {badge}
          </span>
        )}
      </div>
      {expanded && <div className="mt-2">{children}</div>}
    </div>
  );
}

export default CollapsibleSection;
