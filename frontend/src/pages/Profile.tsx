import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Profile() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // MFA Setup State
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setIsMfaEnabled(data.mfaEnabled);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleSetupMfa = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/mfa/setup', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to setup MFA');
      
      const data = await res.json();
      setQrCodeUrl(data.qrCodeUrl);
      setSecret(data.secret);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/auth/mfa/enable?totpCode=${totpCode}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Invalid code');
      
      setSuccess('MFA Enabled Successfully');
      setIsMfaEnabled(true);
      setQrCodeUrl(null);
      setSecret(null);
      setTotpCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-zinc-500">Manage your account security and preferences.</p>
      </div>

      <div className="p-6 bg-white rounded-xl border border-zinc-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck size={20} />
              Multi-Factor Authentication
            </h2>
            <p className="text-sm text-zinc-500">Add an extra layer of security to your account.</p>
          </div>
          {isMfaEnabled ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Enabled</span>
          ) : (
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium">Disabled</span>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
            <ShieldAlert size={16} />
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
            {success}
          </div>
        )}

        {!isMfaEnabled && !qrCodeUrl && (
          <button
            onClick={handleSetupMfa}
            disabled={loading}
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Loading...' : 'Setup MFA'}
          </button>
        )}

        {qrCodeUrl && (
          <div className="space-y-6 border-t border-zinc-100 pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white border border-zinc-200 rounded-xl">
                <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Scan this QR code with your authenticator app</p>
                <p className="text-xs text-zinc-500 font-mono bg-zinc-50 px-2 py-1 rounded">Secret: {secret}</p>
              </div>
            </div>

            <form onSubmit={handleEnableMfa} className="max-w-xs mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Enter Verification Code</label>
                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 text-center tracking-widest"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify & Enable'}
              </button>
            </form>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-zinc-50 rounded-xl border border-zinc-100">
        <h3 className="font-medium mb-2">Account Info</h3>
        <div className="text-sm text-zinc-600">
          <p>Username: {user?.sub}</p>
        </div>
      </div>
    </div>
  );
}
