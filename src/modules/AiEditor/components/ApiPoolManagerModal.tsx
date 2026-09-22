import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  RotateCcw, 
  Plus, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  KeyRound,
  Trash2,
  FileText
} from 'lucide-react';

interface KeyStats {
  requests: number;
  success: number;
  failure: number;
  rateLimits: number;
  lastUsedAt: number | null;
  lastError: string | null;
}

interface MaskedCredential {
  id: string;
  provider: string;
  name: string;
  maskedKey: string;
  supportedTasks: string[];
  priority: number;
  status: 'ACTIVE' | 'COOLDOWN' | 'FAILED' | 'DISABLED';
  cooldownRemainingSeconds: number;
  stats: KeyStats;
}

interface PoolSummary {
  total: number;
  active: number;
  cooldown: number;
  failed: number;
  disabled: number;
}

interface ApiPoolManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiPoolManagerModal: React.FC<ApiPoolManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<PoolSummary>({
    total: 0,
    active: 0,
    cooldown: 0,
    failed: 0,
    disabled: 0
  });
  const [keys, setKeys] = useState<MaskedCredential[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showBulkForm, setShowBulkForm] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('');
  const [newKey, setNewKey] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchPoolData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/api-pool');
      if (res.ok) {
        const data = await res.json();
        if (data.summary) setSummary(data.summary);
        if (data.keys) setKeys(data.keys);
      } else {
        // Fallback to local storage if API call fails
        loadLocalKeysFallback();
      }
    } catch (err) {
      console.error('Failed to fetch API pool status:', err);
      loadLocalKeysFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalKeysFallback = () => {
    try {
      const stored = localStorage.getItem('shafinbd_gemini_keys');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const fallbackKeys: MaskedCredential[] = parsed.map((item, idx) => ({
            id: `LOCAL-${String(idx + 1).padStart(2, '0')}`,
            provider: 'google',
            name: item.name || `Local Key ${idx + 1}`,
            maskedKey: item.apiKey ? `${item.apiKey.slice(0, 4)}...${item.apiKey.slice(-4)}` : 'AIza...',
            supportedTasks: ['passport_photo', 'suit_dress_change', 'background_replace', 'dual_photo'],
            priority: 1,
            status: 'ACTIVE',
            cooldownRemainingSeconds: 0,
            stats: {
              requests: 0,
              success: 0,
              failure: 0,
              rateLimits: 0,
              lastUsedAt: null,
              lastError: null
            }
          }));
          setKeys(fallbackKeys);
          setSummary({
            total: fallbackKeys.length,
            active: fallbackKeys.length,
            cooldown: 0,
            failed: 0,
            disabled: 0
          });
        }
      }
    } catch (e) {
      console.warn('Failed loading local key fallback:', e);
    }
  };

  const saveKeyToLocal = (key: string, name?: string) => {
    try {
      const stored = localStorage.getItem('shafinbd_gemini_keys');
      const list = stored ? JSON.parse(stored) : [];
      if (!list.some((k: { apiKey: string }) => k.apiKey === key)) {
        list.push({ apiKey: key, name: name || `Gemini Account ${list.length + 1}` });
        localStorage.setItem('shafinbd_gemini_keys', JSON.stringify(list));
      }
    } catch (e) {
      console.warn('Failed to save key locally:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPoolData();
      const interval = setInterval(fetchPoolData, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleResetCooldowns = async () => {
    try {
      const res = await fetch('/api/admin/api-pool/reset-cooldowns', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) setSummary(data.summary);
        if (data.keys) setKeys(data.keys);
        setActionMsg('সব কুলডাউন সফলভাবে রিসেট করা হয়েছে!');
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error resetting cooldowns:', err);
    }
  };

  const handleClearFailed = async () => {
    try {
      const res = await fetch('/api/admin/api-pool/clear-failed', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) setSummary(data.summary);
        if (data.keys) setKeys(data.keys);
        setActionMsg(data.message || 'ব্যর্থ কী রিমুভ করা হয়েছে!');
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error clearing failed keys:', err);
    }
  };

  const handleDeleteKey = async (id: string) => {
    // Also remove from local storage if it's a local key or by index
    try {
      const stored = localStorage.getItem('shafinbd_gemini_keys');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list)) {
          let updated = list;
          if (id.startsWith('LOCAL-')) {
            const idx = parseInt(id.replace('LOCAL-', ''), 10) - 1;
            if (idx >= 0 && idx < list.length) {
              updated = list.filter((_, i) => i !== idx);
            }
          } else {
            // Find key in state
            const target = keys.find(k => k.id === id);
            if (target) {
              updated = list.filter(item => {
                const itemMask = item.apiKey ? `${item.apiKey.slice(0, 4)}...${item.apiKey.slice(-4)}` : '';
                return itemMask !== target.maskedKey && item.name !== target.name;
              });
            }
          }
          localStorage.setItem('shafinbd_gemini_keys', JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.warn('Failed removing from local storage:', e);
    }

    try {
      const res = await fetch(`/api/admin/api-pool/key/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) setSummary(data.summary);
        if (data.keys) setKeys(data.keys);
        setActionMsg(`${id} সফলভাবে রিমুভ করা হয়েছে`);
        setTimeout(() => setActionMsg(null), 3000);
        return;
      }
    } catch (err) {
      console.error('Error deleting key:', err);
    }
    loadLocalKeysFallback();
    setActionMsg(`${id} সফলভাবে রিমুভ করা হয়েছে`);
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    // Parse keys for local storage
    const lines = bulkText.trim().split(/[\r\n]+/);
    for (const line of lines) {
      const clean = line.trim();
      if (!clean) continue;
      if (clean.includes(':')) {
        const [name, key] = clean.split(':');
        if (key && key.trim()) saveKeyToLocal(key.trim(), name.trim());
      } else {
        saveKeyToLocal(clean);
      }
    }

    try {
      const res = await fetch('/api/admin/api-pool/bulk-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: bulkText.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) setSummary(data.summary);
        if (data.keys) setKeys(data.keys);
        setBulkText('');
        setShowBulkForm(false);
        setActionMsg(data.message || 'সবগুলো কী সফলভাবে পুলে যুক্ত করা হয়েছে!');
        setTimeout(() => setActionMsg(null), 3000);
      } else {
        loadLocalKeysFallback();
        setBulkText('');
        setShowBulkForm(false);
        setActionMsg('কী লোকাল স্টোরেজে সফলভাবে সেভ করা হয়েছে!');
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error bulk adding keys:', err);
      loadLocalKeysFallback();
      setBulkText('');
      setShowBulkForm(false);
      setActionMsg('কী লোকাল স্টোরেজে সফলভাবে সেভ করা হয়েছে!');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleToggleKey = async (id: string, currentStatus: string) => {
    const enable = currentStatus === 'DISABLED';
    try {
      const res = await fetch('/api/admin/api-pool/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, enabled: enable })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) setSummary(data.summary);
        if (data.keys) setKeys(data.keys);
        return;
      }
    } catch (err) {
      console.error('Error toggling key status:', err);
    }
    // Update local state directly if backend is unavailable
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: enable ? 'ACTIVE' : 'DISABLED' } : k));
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const keyToAdd = newKey.trim();
    const nameToAdd = newName.trim() || undefined;

    // Save to local storage for cold-start resilience
    saveKeyToLocal(keyToAdd, nameToAdd);

    try {
      const res = await fetch('/api/admin/api-pool/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: keyToAdd,
          name: nameToAdd
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.summary) setSummary(data.summary);
        if (data.keys) setKeys(data.keys);
        setNewKey('');
        setNewName('');
        setShowAddForm(false);
        setActionMsg(`${data.id || 'কী'} সফলভাবে পুলে যোগ করা হয়েছে!`);
        setTimeout(() => setActionMsg(null), 3000);
      } else {
        loadLocalKeysFallback();
        setNewKey('');
        setNewName('');
        setShowAddForm(false);
        setActionMsg('কী লোকাল স্টোরেজে সেভ করা হয়েছে এবং রেডি!');
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error adding key:', err);
      loadLocalKeysFallback();
      setNewKey('');
      setNewName('');
      setShowAddForm(false);
      setActionMsg('কী লোকাল স্টোরেজে সেভ করা হয়েছে এবং রেডি!');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-slate-700/80 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#151c2e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                AI API Pool Manager
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono">
                  {summary.total} টি ক্রিডেনশিয়াল
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                স্মার্ট রোটেশন, ৪২৯ কুলডাউন এবং অটোমেটিক ফেইলওভার সিস্টেম
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Message Alert */}
        {actionMsg && (
          <div className="mx-6 mt-3 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Stat Cards */}
        <div className="p-6 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Active */}
          <div className="p-3.5 rounded-xl bg-[#161e31] border border-emerald-900/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">সক্রিয় (Active)</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{summary.active}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Cooldown */}
          <div className="p-3.5 rounded-xl bg-[#161e31] border border-amber-900/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">কুলডাউন (429)</span>
              <span className="text-xl font-black text-amber-400 font-mono">{summary.cooldown}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* Failed */}
          <div className="p-3.5 rounded-xl bg-[#161e31] border border-rose-900/40 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">ব্যর্থ/ভুল কী (Failed)</span>
              <span className="text-xl font-black text-rose-400 font-mono">{summary.failed}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>

          {/* Disabled */}
          <div className="p-3.5 rounded-xl bg-[#161e31] border border-slate-700/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">নিষ্ক্রিয় (Disabled)</span>
              <span className="text-xl font-black text-slate-400 font-mono">{summary.disabled}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(prev => !prev);
                setShowBulkForm(false);
              }}
              className="h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন কী</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowBulkForm(prev => !prev);
                setShowAddForm(false);
              }}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>একসাথে একাধিক কী (Bulk Add)</span>
            </button>

            <button
              type="button"
              onClick={handleResetCooldowns}
              className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>কুলডাউন রিসেট</span>
            </button>

            {summary.failed > 0 && (
              <button
                type="button"
                onClick={handleClearFailed}
                className="h-8 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-700/60"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>ব্যর্থ কী মুছুন ({summary.failed})</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchPoolData}
            disabled={loading}
            className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        {/* Add New Key Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleAddKey} className="mx-6 my-2 p-3.5 rounded-xl bg-[#182033] border border-amber-500/30 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              একটি Google Gemini API কী সংযুক্ত করুন
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Gemini API Key (AIzaSy...)"
                required
                className="h-8 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="অ্যাকাউন্টের নাম (ঐচ্ছিক, e.g. Google Acc 03)"
                className="h-8 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="h-7 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="h-7 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs text-white font-bold cursor-pointer"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        )}

        {/* Bulk Add Keys Drawer */}
        {showBulkForm && (
          <form onSubmit={handleBulkAdd} className="mx-6 my-2 p-3.5 rounded-xl bg-[#182033] border border-blue-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                একসাথে একাধিক API কী পেস্ট করুন
              </h4>
              <span className="text-[11px] text-slate-400">
                প্রতি লাইনে একটি কী অথবা &quot;নাম: কী&quot; ফরম্যাটে
              </span>
            </div>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`djrashidulboss: AIzaSyC_QF8tL0h5BtTdD_Uf5dTCNuGsgQqOlIc\nshafin dokan: AIzaSyBnvUiVfE7sZsKyptfb_uUggh8Rsd4fOCE\nAIzaSyD9yCDAinP98OjGHrUjojXBXr0NE-MoUpw`}
              rows={4}
              required
              className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkForm(false)}
                className="h-7 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="h-7 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs text-white font-bold cursor-pointer"
              >
                সবগুলো কী পুলে যোগ করুন
              </button>
            </div>
          </form>
        )}

        {/* Keys Table / List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-2 space-y-2">
          {keys.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <KeyRound className="w-8 h-8 mx-auto mb-2 text-slate-500 stroke-[1.5]" />
              <p className="text-xs font-medium">কোনো এপিআই কী সক্রিয় নেই।</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                উপরে &quot;নতুন কী যোগ করুন&quot; বোতামে ক্লিক করে কী যুক্ত করুন।
              </p>
            </div>
          ) : (
            keys.map((k) => {
              const isCool = k.status === 'COOLDOWN';
              const isAct = k.status === 'ACTIVE';
              const isFail = k.status === 'FAILED';

              return (
                <div 
                  key={k.id}
                  className="p-3 rounded-xl bg-[#141b2c] border border-slate-800/80 hover:border-slate-700 flex flex-col gap-2 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md shrink-0">
                        {k.id}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{k.name}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">{k.maskedKey}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span>রিকোয়েস্ট: <strong className="text-slate-200">{k.stats.requests}</strong></span>
                          <span>•</span>
                          <span>সফল: <strong className="text-emerald-400">{k.stats.success}</strong></span>
                          <span>•</span>
                          <span>ব্যর্থ: <strong className="text-rose-400">{k.stats.failure}</strong></span>
                          {k.stats.rateLimits > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-semibold">৪২৯ লিমিট: {k.stats.rateLimits}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Status Badge */}
                      {isAct && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </span>
                      )}

                      {isCool && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3 text-amber-400" />
                          COOLDOWN ({k.cooldownRemainingSeconds}s)
                        </span>
                      )}

                      {isFail && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                          FAILED
                        </span>
                      )}

                      {k.status === 'DISABLED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                          DISABLED
                        </span>
                      )}

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleKey(k.id, k.status)}
                        className={`h-7 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          k.status === 'DISABLED'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {k.status === 'DISABLED' ? 'চালু করুন' : 'পজ'}
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteKey(k.id)}
                        title="কী মুছে ফেলুন"
                        className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-rose-950 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer border border-slate-700/50 hover:border-rose-800/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Last Error detail note if failed or cooldown */}
                  {k.stats.lastError && (
                    <div className="mt-1 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{k.stats.lastError}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0e1424] text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            💡 কোনো কি ৪২৯ কোটা লিমিটে পৌঁছালে স্বয়ংক্রিয়ভাবে ৬০ সেকেন্ডের কুলডাউনে যাবে এবং পরবর্তী কি দিয়ে কাজ সম্পন্ন হবে।
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
