import { getCookieExplanation, CATEGORY_INFO, parseCookieHeader } from '../shared/cookie-explanations';

interface CookieInspectorProps {
  requestCookies: string | null;
  responseCookies: string[];
}

function CookieInspector({ requestCookies, responseCookies }: CookieInspectorProps) {
  const sentCookies = requestCookies ? parseCookieHeader(requestCookies) : [];
  
  // Group cookies by category
  const categorizedCookies = sentCookies.map(cookie => ({
    ...cookie,
    explanation: getCookieExplanation(cookie.name),
  }));

  // Count by category
  const categoryCount = categorizedCookies.reduce((acc, c) => {
    acc[c.explanation.category] = (acc[c.explanation.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by risk
  const riskCount = {
    low: categorizedCookies.filter(c => c.explanation.risk === 'low').length,
    medium: categorizedCookies.filter(c => c.explanation.risk === 'medium').length,
    high: categorizedCookies.filter(c => c.explanation.risk === 'high').length,
  };

  if (sentCookies.length === 0 && responseCookies.length === 0) {
    return (
      <div className="text-sm text-gray-400">
        No cookies in this request
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      {sentCookies.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">{sentCookies.length} cookies sent:</span>
          {riskCount.low > 0 && (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
              {riskCount.low} low risk
            </span>
          )}
          {riskCount.medium > 0 && (
            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
              {riskCount.medium} medium risk
            </span>
          )}
          {riskCount.high > 0 && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
              {riskCount.high} high risk
            </span>
          )}
        </div>
      )}

      {/* Sent Cookies */}
      {sentCookies.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 mb-2">Cookies Sent to Server</h4>
          <div className="space-y-2">
            {categorizedCookies.map((cookie, index) => {
              const catInfo = CATEGORY_INFO[cookie.explanation.category];
              return (
                <div
                  key={index}
                  className={`p-2 rounded border ${
                    cookie.explanation.risk === 'high'
                      ? 'border-red-200 bg-red-50'
                      : cookie.explanation.risk === 'medium'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium">{cookie.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {cookie.explanation.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-mono truncate" title={cookie.value}>
                    Value: {cookie.value.length > 50 ? cookie.value.substring(0, 50) + '...' : cookie.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Cookies Set by Response */}
      {responseCookies.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 mb-2">
            New Cookies Set by Server ({responseCookies.length})
          </h4>
          <div className="space-y-2">
            {responseCookies.map((setCookie, index) => {
              const [nameValue] = setCookie.split(';');
              const [name] = nameValue.split('=');
              const explanation = getCookieExplanation(name);
              const catInfo = CATEGORY_INFO[explanation.category];
              
              // Parse attributes
              const attrs = setCookie.split(';').slice(1).map(a => a.trim().toLowerCase());
              const isSecure = attrs.some(a => a === 'secure');
              const isHttpOnly = attrs.some(a => a === 'httponly');
              const sameSite = attrs.find(a => a.startsWith('samesite'))?.split('=')[1] || 'none specified';
              
              return (
                <div
                  key={index}
                  className={`p-2 rounded border ${
                    explanation.risk === 'high'
                      ? 'border-red-200 bg-red-50'
                      : explanation.risk === 'medium'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium">{name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${catInfo.color}`}>
                      {catInfo.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {explanation.description}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {isSecure && (
                      <span className="text-xs px-1 py-0.5 bg-green-100 text-green-700 rounded">
                        🔒 Secure
                      </span>
                    )}
                    {isHttpOnly && (
                      <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-700 rounded">
                        🛡️ HttpOnly
                      </span>
                    )}
                    <span className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700 rounded">
                      SameSite: {sameSite}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryCount).length > 1 && (
        <div className="text-xs text-gray-500 pt-2 border-t">
          <span className="font-semibold">Categories:</span>{' '}
          {Object.entries(categoryCount).map(([cat, count]) => (
            <span key={cat} className="mr-2">
              {CATEGORY_INFO[cat]?.label}: {count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default CookieInspector;
