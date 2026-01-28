import { useState } from 'react';

interface JsonViewerProps {
  data: unknown;
  initialExpanded?: boolean;
  maxStringLength?: number;
}

function JsonViewer({ data, initialExpanded = true, maxStringLength = 100 }: JsonViewerProps) {
  return (
    <div className="font-mono text-xs">
      <JsonNode 
        data={data} 
        depth={0} 
        initialExpanded={initialExpanded}
        maxStringLength={maxStringLength}
      />
    </div>
  );
}

interface JsonNodeProps {
  data: unknown;
  depth: number;
  keyName?: string;
  initialExpanded: boolean;
  maxStringLength: number;
}

function JsonNode({ data, depth, keyName, initialExpanded, maxStringLength }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(initialExpanded && depth < 2);
  const indent = depth * 16;

  // Handle null
  if (data === null) {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName && <span className="text-purple-600">"{keyName}"</span>}
        {keyName && <span className="text-gray-500">: </span>}
        <span className="text-gray-500">null</span>
      </div>
    );
  }

  // Handle undefined
  if (data === undefined) {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName && <span className="text-purple-600">"{keyName}"</span>}
        {keyName && <span className="text-gray-500">: </span>}
        <span className="text-gray-500">undefined</span>
      </div>
    );
  }

  // Handle primitives
  if (typeof data !== 'object') {
    let valueElement;
    let valueClass = 'text-gray-800';
    
    if (typeof data === 'string') {
      valueClass = 'text-green-600';
      const displayValue = data.length > maxStringLength 
        ? `"${data.substring(0, maxStringLength)}..."` 
        : `"${data}"`;
      valueElement = <span className={valueClass}>{displayValue}</span>;
    } else if (typeof data === 'number') {
      valueClass = 'text-blue-600';
      valueElement = <span className={valueClass}>{String(data)}</span>;
    } else if (typeof data === 'boolean') {
      valueClass = 'text-orange-600';
      valueElement = <span className={valueClass}>{String(data)}</span>;
    } else {
      valueElement = <span className={valueClass}>{String(data)}</span>;
    }

    return (
      <div style={{ paddingLeft: indent }}>
        {keyName && <span className="text-purple-600">"{keyName}"</span>}
        {keyName && <span className="text-gray-500">: </span>}
        {valueElement}
      </div>
    );
  }

  // Handle arrays
  if (Array.isArray(data)) {
    const isEmpty = data.length === 0;
    
    if (isEmpty) {
      return (
        <div style={{ paddingLeft: indent }}>
          {keyName && <span className="text-purple-600">"{keyName}"</span>}
          {keyName && <span className="text-gray-500">: </span>}
          <span className="text-gray-500">[]</span>
        </div>
      );
    }

    return (
      <div>
        <div 
          style={{ paddingLeft: indent }}
          className="cursor-pointer hover:bg-gray-100 rounded"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-gray-400 select-none">{expanded ? '▼' : '▶'}</span>
          {keyName && <span className="text-purple-600"> "{keyName}"</span>}
          {keyName && <span className="text-gray-500">: </span>}
          <span className="text-gray-500">[</span>
          {!expanded && (
            <span className="text-gray-400"> {data.length} items ]</span>
          )}
        </div>
        {expanded && (
          <>
            {data.map((item, index) => (
              <JsonNode 
                key={index} 
                data={item} 
                depth={depth + 1}
                keyName={String(index)}
                initialExpanded={initialExpanded}
                maxStringLength={maxStringLength}
              />
            ))}
            <div style={{ paddingLeft: indent }}>
              <span className="text-gray-500">]</span>
            </div>
          </>
        )}
      </div>
    );
  }

  // Handle objects
  const entries = Object.entries(data as Record<string, unknown>);
  const isEmpty = entries.length === 0;

  if (isEmpty) {
    return (
      <div style={{ paddingLeft: indent }}>
        {keyName && <span className="text-purple-600">"{keyName}"</span>}
        {keyName && <span className="text-gray-500">: </span>}
        <span className="text-gray-500">{'{}'}</span>
      </div>
    );
  }

  return (
    <div>
      <div 
        style={{ paddingLeft: indent }}
        className="cursor-pointer hover:bg-gray-100 rounded"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-gray-400 select-none">{expanded ? '▼' : '▶'}</span>
        {keyName && <span className="text-purple-600"> "{keyName}"</span>}
        {keyName && <span className="text-gray-500">: </span>}
        <span className="text-gray-500">{'{'}</span>
        {!expanded && (
          <span className="text-gray-400"> {entries.length} properties {'}'}</span>
        )}
      </div>
      {expanded && (
        <>
          {entries.map(([key, value]) => (
            <JsonNode 
              key={key} 
              data={value} 
              depth={depth + 1}
              keyName={key}
              initialExpanded={initialExpanded}
              maxStringLength={maxStringLength}
            />
          ))}
          <div style={{ paddingLeft: indent }}>
            <span className="text-gray-500">{'}'}</span>
          </div>
        </>
      )}
    </div>
  );
}

// Helper to safely parse JSON
export function tryParseJson(text: string): { success: true; data: unknown } | { success: false; error: string } {
  try {
    const data = JSON.parse(text);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export default JsonViewer;
