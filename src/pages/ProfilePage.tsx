// project/src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [wallet, setWallet] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>('');
  const [err, setErr] = useState<string>('');
  const [topup, setTopup] = useState<string>('');
  const [withdrawAmt, setWithdrawAmt] = useState<string>('');
  const [withdrawAddr, setWithdrawAddr] = useState<string>('');

  // Always return a plain string map so it satisfies HeadersInit
  const authHeader = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg('');
      setErr('');
      try {
        const headers: Record<string, string> = { ...authHeader() };
        const res = await fetch('/api/profile', { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load profile');

        setName(data.user.name ?? '');
        setPhone(data.user.phone ?? '');
        setWallet(data.user.walletAddress ?? '');
        updateUser({
          name: data.user.name,
          realBalance: data.user.realBalance,
          virtualBalance: data.user.virtualBalance,
        });
      } catch (e: any) {
        setErr(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async () => {
    setMsg('');
    setErr('');
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeader(),
      };
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      updateUser({ name: data.user.name });
      setMsg('Profile updated.');
    } catch (e: any) {
      setErr(e.message || 'Update failed');
    }
  };

  const deposit = async () => {
    setMsg('');
    setErr('');
    const amount = Number(topup);
    if (!Number.isFinite(amount) || amount <= 0) { setErr('Invalid amount'); return; }
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeader(),
      };
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deposit failed');
      updateUser({
        realBalance: data.balance.realBalance,
        virtualBalance: data.balance.virtualBalance,
      });
      setMsg('Balance topped up (simulated).');
      setTopup('');
    } catch (e: any) {
      setErr(e.message || 'Deposit failed');
    }
  };

  const withdraw = async () => {
    setMsg('');
    setErr('');
    const amount = Number(withdrawAmt);
    if (!Number.isFinite(amount) || amount <= 0) { setErr('Invalid amount'); return; }
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...authHeader(),
      };
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount, address: withdrawAddr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Withdraw failed');
      updateUser({
        realBalance: data.balance.realBalance,
        virtualBalance: data.balance.virtualBalance,
      });
      setMsg('Withdrawal requested (simulated).');
      setWithdrawAmt('');
    } catch (e: any) {
      setErr(e.message || 'Withdraw failed');
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-3.5rem-3rem)] bg-gray-900 text-white p-6">Loading…</div>;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem-3rem)] bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>

        {msg && <div className="rounded bg-emerald-900/40 border border-emerald-700 px-4 py-2">{msg}</div>}
        {err && <div className="rounded bg-red-900/40 border border-red-700 px-4 py-2">{err}</div>}

        <div className="rounded bg-gray-800 p-6 space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input disabled className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-300" value={user?.email ?? ''} />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Name</label>
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Phone</label>
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Wallet Address</label>
            <div className="flex gap-2">
              <input
                disabled
                className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-300"
                value={wallet}
              />
              <button
                className="px-3 rounded bg-gray-700 hover:bg-gray-600"
                onClick={() => navigator.clipboard.writeText(wallet)}
              >
                Copy
              </button>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500" onClick={saveProfile}>
            Save
          </button>
        </div>

        <div className="rounded bg-gray-800 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Top-up (USDT, simulated)</h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100"
              value={topup}
              onChange={(e) => setTopup(e.target.value)}
            />
            <button className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-500" onClick={deposit}>
              Top Up
            </button>
          </div>
        </div>

        <div className="rounded bg-gray-800 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Withdraw (to crypto wallet, simulated)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="Amount"
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100"
              value={withdrawAmt}
              onChange={(e) => setWithdrawAmt(e.target.value)}
            />
            <input
              type="text"
              placeholder="0x... address"
              className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100"
              value={withdrawAddr}
              onChange={(e) => setWithdrawAddr(e.target.value)}
            />
            <button className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-500" onClick={withdraw}>
              Request Withdraw
            </button>
          </div>
          <p className="text-xs text-gray-400">This is a simulated flow. We can wire actual on-chain USDT next.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
