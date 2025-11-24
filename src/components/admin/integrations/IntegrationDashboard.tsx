import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Server, 
  ShieldCheck, 
  Activity, 
  Search,
  Plus,
  X,
  HelpCircle
} from 'lucide-react';
import { ProviderCard, ProviderProps } from './ProviderCard';
import { ConnectionStatus } from './IntegrationStatusBadge';

export default function IntegrationDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [providers, setProviders] = useState<ProviderProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);

  // Fetch status on load
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/integrations/status');
        const data = await res.json();
        
        // Merge API status with static definitions
        const updatedProviders = initialProviders.map(p => {
          const statusData = data.providers[p.id];
          if (statusData) {
            return { 
              ...p, 
              status: statusData.status as ConnectionStatus, 
              lastSync: statusData.lastSync ? new Date(statusData.lastSync) : undefined 
            };
          }
          return p;
        });
        
        setProviders(updatedProviders);
      } catch (err) {
        console.error('Failed to fetch integration status', err);
        setProviders(initialProviders);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/integrations/logs');
      const data = await res.json();
      setLogs(data.logs);
      setShowLogs(true);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  const handleConnect = async (providerId: string) => {
    setConnectionError('');
    try {
      const res = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, apiKey })
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update local state
        setProviders(prev => prev.map(p => 
          p.id === providerId ? { ...p, status: 'connected', lastSync: new Date() } : p
        ));
        setConnectingProvider(null);
        setApiKey('');
      } else {
        setConnectionError(data.error || 'Connection failed');
      }
    } catch (err) {
      setConnectionError('Network error occurred');
    }
  };

  // Static definitions
  const initialProviders: ProviderProps[] = [
    {
      id: 'wonde',
      name: 'Wonde',
      description: 'The standard for UK school data. Connects to SIMS, Arbor, Bromcom, and ScholarPack.',
      logo: '⚡',
      status: 'disconnected',
      features: ['Real-time Student Sync', 'Staff Directory', 'Timetables', 'Attendance'],
      onConnect: () => setConnectingProvider('wonde'),
      onConfigure: () => console.log('Config Wonde'),
      helpText: 'You can find your API Token in the Wonde Portal under "API Settings". If you are unsure, please ask your IT Network Manager.'
    },
    {
      id: 'sims-legacy',
      name: 'SIMS (On-Premise)',
      description: 'Direct connection for schools hosting SIMS locally via the Command Reporter gateway.',
      logo: '🏢',
      status: 'disconnected',
      features: ['Nightly XML Sync', 'Student Records', 'Assessment Data'],
      onConnect: () => setConnectingProvider('sims-legacy'),
      onConfigure: () => console.log('Config SIMS'),
      helpText: 'Enter the secure Gateway URL provided by your IT team after installing the EdPsych Connector.'
    },
    {
      id: 'arbor',
      name: 'Arbor MIS',
      description: 'Cloud-native MIS integration for modern multi-academy trusts.',
      logo: '🌳',
      status: 'pending',
      features: ['API V2 Support', 'Behavior Incidents', 'Assessment Write-back'],
      onConnect: () => setConnectingProvider('arbor'),
      onConfigure: () => console.log('Config Arbor'),
      helpText: 'Generate an API Key in Arbor under System > Partner Apps > EdPsych Connect.'
    },
    {
      id: 'cpoms',
      name: 'CPOMS',
      description: 'Safeguarding and child protection software integration.',
      logo: '🛡️',
      status: 'disconnected',
      features: ['Safeguarding Alerts', 'Incident Logging'],
      onConnect: () => setConnectingProvider('cpoms'),
      onConfigure: () => console.log('Config CPOMS'),
      helpText: 'Contact CPOMS support to request an API Key for EdPsych Connect.'
    },
    {
      id: 'azure-ad',
      name: 'Microsoft Entra ID',
      description: 'Single Sign-On (SSO) and user provisioning for staff and students.',
      logo: '🔑',
      status: 'disconnected',
      features: ['SAML 2.0 SSO', 'Group Sync', 'MFA Enforcement'],
      onConnect: () => setConnectingProvider('azure-ad'),
      onConfigure: () => console.log('Config Azure'),
      helpText: 'You will need your Tenant ID and Client Secret from the Azure Portal.'
    }
  ];

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 relative">
      {/* Connection Modal */}
      <AnimatePresence>
        {showLogs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">Integration Sync Logs</h3>
                <button 
                  onClick={() => setShowLogs(false)} 
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close logs"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="font-medium text-slate-900">{log.provider}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{log.details}</p>
                    <div className="text-xs text-slate-400 font-mono">
                      Records Processed: {log.recordsProcessed}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {connectingProvider && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">Connect {providers.find(p => p.id === connectingProvider)?.name}</h3>
                <button 
                  onClick={() => setConnectingProvider(null)} 
                  className="text-slate-400 hover:text-slate-600"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-slate-500 mb-4">
                Enter your API credentials to establish a secure connection.
              </p>

              {providers.find(p => p.id === connectingProvider)?.helpText && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-xs rounded-lg flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{providers.find(p => p.id === connectingProvider)?.helpText}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">API Key / Token</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="sk_live_..."
                  />
                </div>

                {connectionError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    {connectionError}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setConnectingProvider(null)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleConnect(connectingProvider)}
                    disabled={!apiKey}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Ecosystem Integrations</h1>
            <p className="text-slate-500 max-w-2xl">
              Manage connections to external systems. Securely sync student data, staff directories, and assessment results across your entire estate.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
            >
              <Activity className="w-4 h-4 text-slate-400" />
              View Sync Logs
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm shadow-indigo-200">
              <Plus className="w-4 h-4" />
              Add Custom Integration
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <Server className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Connections</p>
                <h3 className="text-2xl font-bold text-slate-900">
                  {providers.filter(p => p.status === 'connected').length}/{providers.length}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Records Synced (24h)</p>
                <h3 className="text-2xl font-bold text-slate-900">12,450</h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Data Sovereignty</p>
                <h3 className="text-2xl font-bold text-slate-900">Hybrid Mode</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'connected', 'disconnected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading ? (
               <div className="col-span-3 text-center py-12 text-slate-400">Loading integrations...</div>
            ) : (
              filteredProviders.map((provider) => (
                <ProviderCard key={provider.id} {...provider} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
