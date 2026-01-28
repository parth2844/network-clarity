import { useEffect, useState } from 'react';
import { TabData, GetTabDataResponse } from '../shared/types';

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

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Network Clarity</h1>
        <p className="text-sm text-gray-500 truncate" title={pageDomain}>
          {pageDomain || 'Unknown page'}
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">{stats.totalRequests}</div>
          <div className="text-sm text-gray-500">Total Requests</div>
        </div>
      </div>

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

      {/* Summary Text */}
      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        {stats.trackerCount > 0 ? (
          <p>
            This page contacted <strong>{stats.uniqueDomains.length}</strong> different domains,{' '}
            <strong className="text-tracker">{stats.trackerDomains.length}</strong> of which are
            known trackers.
          </p>
        ) : (
          <p>
            This page contacted <strong>{stats.uniqueDomains.length}</strong> different domains.
            No known trackers detected.
          </p>
        )}
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
