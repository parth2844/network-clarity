import { useEffect, useState } from 'react';
import { TabData, GetTabDataResponse } from '../shared/types';
import { calculatePrivacyScore, getGradeColor, getGradeEmoji, PrivacyScoreResult } from '../shared/privacy-score';

function Popup() {
  const [tabData, setTabData] = useState<TabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current tab ID
        const tabResponse = await chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' });
        const tabId = tabResponse.tabId;

        if (tabId < 0) {
          setError('Unable to access current tab');
          setLoading(false);
          return;
        }

        // Get tab data
        const dataResponse: GetTabDataResponse = await chrome.runtime.sendMessage({
          type: 'GET_TAB_DATA',
          tabId,
        });

        if (dataResponse.success && dataResponse.data) {
          setTabData(dataResponse.data);
        } else {
          setError(dataResponse.error || 'No data available');
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg mb-2">No data yet</p>
          <p className="text-sm">Navigate to a webpage and refresh this popup</p>
        </div>
      </div>
    );
  }

  if (!tabData) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg mb-2">No requests captured</p>
          <p className="text-sm">Refresh the page to start monitoring</p>
        </div>
      </div>
    );
  }

  const { stats, pageDomain } = tabData;
  
  // Calculate privacy score
  const privacyScore: PrivacyScoreResult = calculatePrivacyScore(stats);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Network Clarity</h1>
        <p className="text-sm text-gray-500 truncate" title={pageDomain}>
          {pageDomain || 'Unknown page'}
        </p>
      </div>

      {/* Privacy Score Card */}
      <div className={`rounded-lg p-4 mb-4 ${getGradeColor(privacyScore.grade)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium opacity-80">Privacy Score</div>
            <div className="text-xs mt-1 opacity-70">{privacyScore.summary}</div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              {getGradeEmoji(privacyScore.grade)} {privacyScore.grade}
            </div>
            <div className="text-xs opacity-70">{privacyScore.score}/100</div>
          </div>
        </div>
      </div>

      {/* Privacy Details */}
      {privacyScore.details.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-xs font-semibold text-gray-600 mb-2">Issues Found</div>
          {privacyScore.details.map((detail, index) => (
            <div key={index} className="text-xs text-gray-600 py-1 flex items-start">
              <span className="mr-2">•</span>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* First Party */}
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-first-party">{stats.firstPartyCount}</div>
          <div className="text-xs text-gray-600">First Party</div>
        </div>

        {/* Third Party */}
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-third-party">{stats.thirdPartyCount}</div>
          <div className="text-xs text-gray-600">Third Party</div>
        </div>

        {/* Trackers */}
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-tracker">{stats.trackerCount}</div>
          <div className="text-xs text-gray-600">Trackers</div>
        </div>
      </div>

      {/* Tracker List */}
      {stats.trackerDomains.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Detected Trackers</h2>
          <div className="bg-red-50 rounded-lg p-3 max-h-32 overflow-y-auto">
            {stats.trackerDomains.map((domain) => (
              <div key={domain} className="text-sm text-red-700 py-1 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                {domain}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Flow Summary */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="text-xs font-semibold text-gray-600 mb-2">Data Flow</div>
        <div className="text-sm text-gray-700">
          This page sends data to <strong>{stats.uniqueDomains.length}</strong> different servers
          {stats.trackerCount > 0 && (
            <>, including <strong className="text-tracker">{stats.trackerDomains.length}</strong> known trackers</>
          )}
          .
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          Open DevTools → Network Clarity tab for details
        </p>
      </div>
    </div>
  );
}

export default Popup;
