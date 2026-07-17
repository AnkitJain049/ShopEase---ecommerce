import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

function AdminMetrics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cache');
  const [povTab, setPovTab] = useState('system');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [activeTab, povTab]);

  const handleDownloadLogs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/download-logs?type=${povTab}`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to download log file.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = povTab === 'system' ? 'system_metrics.json' : 'user_metrics.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download log file. Ensure you are logged in as admin.');
    }
  };

  // Fetch administrative statistics & user records from API
  const { data, loading, error } = useFetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/admin/metrics`
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  // Handle unauthorized or other errors
  if (error || (data && !data.success)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-300">
        <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-700/80 space-y-4">
          <div className="text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white font-display">Access Denied</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This workspace routing panel is reserved for administrators only.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display rounded-xl transition shadow-sm hover:shadow cursor-pointer"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const { users = [], transactions = [], metrics = {} } = data || {};
  const { 
    hitRate = 0, 
    avgHitTime = 0, 
    avgMissTime = 0, 
    userAvgHitTime = 0, 
    userAvgMissTime = 0, 
    totalRequests = 0, 
    systemLogs = [], 
    userLogs = [] 
  } = metrics;

  // Calculate speed improvement factor
  const speedRatio = avgHitTime > 0 ? (avgMissTime / avgHitTime).toFixed(1) : 'N/A';
  const userSpeedRatio = userAvgHitTime > 0 ? (userAvgMissTime / userAvgHitTime).toFixed(1) : 'N/A';

  return (
    <div className="min-h-screen bg-gray-55 dark:bg-gray-900 py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">System Performance & Diagnostics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time cache hit rates, database response latencies, and transaction reports.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="self-start px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold font-display text-xs rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
          >
            🔄 Refresh Metrics
          </button>
        </div>

        {/* Dashboard Grid Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Cache Hit Rate */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-display">Cache Hit Rate</h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-gray-900 dark:text-white font-display">{hitRate}%</span>
              <span className="text-xs text-green-500 font-bold">In-Memory</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Requests resolved via Node.js RAM.</p>
          </div>

          {/* Average Cache Response Time */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-display">Avg Cache Latency</h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-gray-400">Server POV:</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">{avgHitTime}ms</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-gray-400">User POV:</span>
                <span className="text-blue-500 dark:text-blue-300 font-mono">{userAvgHitTime}ms</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Latency of RAM Cache lookups.</p>
          </div>

          {/* Average DB Latency */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-display">Avg DB Latency</h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-gray-400">Server POV:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{avgMissTime}ms</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-gray-400">User POV:</span>
                <span className="text-indigo-500 dark:text-indigo-300 font-mono">{userAvgMissTime}ms</span>
              </div>
            </div>
            <p className="text-xs text-gray-550 dark:text-gray-400">Latency of raw MongoDB operations.</p>
          </div>

          {/* Speed Improvement */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-md space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-6 -mt-6"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-100 font-display">Performance Boost</h3>
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-200">Server Speedup:</span>
                <span className="font-bold">{speedRatio}x</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-200">User Speedup:</span>
                <span className="font-bold">{userSpeedRatio}x</span>
              </div>
            </div>
            <p className="text-xs text-blue-100">Relative speed improvement of cache vs database.</p>
          </div>
        </div>

        {/* Tab switch Navigation Bar */}
        <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm flex space-x-2 max-w-lg">
          <button
            onClick={() => { setActiveTab('cache'); setPovTab('system'); }}
            className={`flex-1 py-2.5 text-xs font-bold font-display rounded-xl transition ${
              activeTab === 'cache'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            ⚡ Diagnostics Logs ({totalRequests})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2.5 text-xs font-bold font-display rounded-xl transition ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            👥 Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2.5 text-xs font-bold font-display rounded-xl transition ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            📦 Recent Orders ({transactions.length})
          </button>
        </div>

        {/* Tab Views Content */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm overflow-hidden">
          
          {/* TAB 1: CACHE LOGS */}
          {activeTab === 'cache' && (
            <div className="space-y-4 p-6">
              {/* Sub-tab selection bar and Download Button */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl flex space-x-2 max-w-md flex-1">
                  <button
                    onClick={() => setPovTab('system')}
                    className={`flex-1 py-2 text-xs font-bold font-display rounded-lg transition ${
                      povTab === 'system'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    🖥️ System POV (Node.js Processing)
                  </button>
                  <button
                    onClick={() => setPovTab('user')}
                    className={`flex-1 py-2 text-xs font-bold font-display rounded-lg transition ${
                      povTab === 'user'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    📱 User POV (Browser Roundtrip)
                  </button>
                </div>

                <button
                  onClick={handleDownloadLogs}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold font-display text-xs rounded-xl shadow-sm hover:shadow cursor-pointer transition flex items-center gap-1.5 self-start md:self-auto"
                >
                  📥 Download {povTab === 'system' ? 'System' : 'User'} Logs (.json)
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-200/50 dark:border-gray-700/50 rounded-2xl">
                <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs uppercase text-gray-400 font-bold font-display">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Endpoint Path</th>
                      <th className="px-6 py-4">User Session</th>
                      <th className="px-6 py-4">Cache Status</th>
                      <th className="px-6 py-4">Latency (ms)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50 text-sm text-gray-700 dark:text-gray-200">
                    {povTab === 'system' ? (
                      systemLogs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">
                            No system-level metrics logs recorded yet. Visit the catalog to trigger hits/misses.
                          </td>
                        </tr>
                      ) : (
                        systemLogs.slice(0, visibleCount).map((log, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-400">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-blue-650 dark:text-blue-400 font-semibold">{log.url}</td>
                            <td className="px-6 py-4 text-xs font-medium">{log.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                log.status === 'HIT'
                                  ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200/20'
                                  : 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200/20'
                              }`}>
                                {log.status === 'HIT' ? '⚡ CACHE HIT' : '💾 DB MISS'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold font-mono">{log.duration} ms</td>
                          </tr>
                        ))
                      )
                    ) : (
                      userLogs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-400 font-medium">
                            No client-reported latency logs recorded yet. Navigate the web catalog to report browser roundtrips.
                          </td>
                        </tr>
                      ) : (
                        userLogs.slice(0, visibleCount).map((log, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-400">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-blue-650 dark:text-blue-400 font-semibold">{log.url}</td>
                            <td className="px-6 py-4 text-xs font-medium">{log.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                log.status === 'HIT'
                                  ? 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200/20'
                                  : 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200/20'
                              }`}>
                                {log.status === 'HIT' ? '⚡ CACHE HIT' : '💾 DB MISS'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold font-mono">{log.duration} ms</td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Load More Button */}
              {((povTab === 'system' && systemLogs.length > visibleCount) ||
                (povTab === 'user' && userLogs.length > visibleCount)) && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="px-6 py-2.5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-white font-bold font-display text-xs rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer transition"
                  >
                    📂 Load More Records ({povTab === 'system' ? systemLogs.length - visibleCount : userLogs.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REGISTERED USERS */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs uppercase text-gray-400 font-bold font-display">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50 text-sm text-gray-700 dark:text-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-400">No users found.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <img
                            src={user.profilePic || 'default.jpg'}
                            alt=""
                            className="w-8 h-8 rounded-full border border-gray-200/50 dark:border-gray-700/50 object-cover"
                            onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + user.email; }}
                          />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold">{user.contactNumber || 'N/A'}</td>
                        <td className="px-6 py-4 text-xs text-gray-550 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: RECENT ORDERS */}
          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs uppercase text-gray-400 font-bold font-display">
                  <tr>
                    <th className="px-6 py-4">Transaction / Buyer</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4">Payment Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50 text-sm text-gray-700 dark:text-gray-200">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No orders placed yet.</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 dark:text-white leading-tight">{tx.userName}</p>
                          <p className="text-xs text-gray-400 font-mono">{new Date(tx.date || tx.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-850 dark:text-gray-200">
                          {tx.productId ? tx.productId.name : 'Deleted Product'}
                        </td>
                        <td className="px-6 py-4 font-black font-display text-green-600 dark:text-green-400">
                          ₹{tx.amount}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs space-y-0.5">
                          <div className="text-gray-700 dark:text-gray-300"><span className="text-gray-400">Pay:</span> {tx.paymentId}</div>
                          <div className="text-gray-400"><span className="text-gray-500">Order:</span> {tx.orderId}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default AdminMetrics;
