import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { authService, cdnApiClient } from "../../services/authService";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";

const UserSettings: React.FC = () => {
  const { user, refreshToken, logout } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");  const [twoFASecret, setTwoFASecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [disableTwoFACode, setDisableTwoFACode] = useState("");

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cdnApiClient.put("/auth/change-email", { new_email: newEmail });
      toast.success("Email updated!");
      setEmail(newEmail);
      setNewEmail("");
      await refreshToken();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update email");
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await cdnApiClient.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
      logout();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update password");
    }
    setLoading(false);
  };  const start2FASetup = async () => {
    setLoading(true);
    try {
      const res = await authService.setup2FA({ enable: true });
      console.log("2FA API Response:", res);
      
      setTwoFASecret(res.secret);
      setOtpauthUrl(res.otpauth_url);
      setShow2FASetup(true);
    } catch (err: any) {
      console.error("2FA Setup Error:", err);
      toast.error(err?.response?.data?.error || "Failed to start 2FA setup");
    }
    setLoading(false);
  };
  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verify2FA({ token: twoFACode });
      toast.success("2FA enabled!");
      setShow2FASetup(false);
      setTwoFACode("");
      await refreshToken();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Invalid code");
    }
    setLoading(false);
  };  const handle2FADisable = async () => {
    setShow2FADisable(true);
  };

  const confirmDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.setup2FA({ enable: false, token: disableTwoFACode });
      toast.success("2FA disabled");
      setShow2FADisable(false);
      setDisableTwoFACode("");
      await refreshToken();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to disable 2FA");
    }
    setLoading(false);
  };

  const cancelDisable2FA = () => {
    setShow2FADisable(false);
    setDisableTwoFACode("");
  };return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">User Settings</h2>
      <form onSubmit={handleChangeEmail} className="mb-6">
        <label className="block mb-2 font-semibold">Change Email</label>
        <input
          type="email"
          className="input input-bordered w-full mb-2"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder={email}
          required
        />
        <button className="btn btn-primary" disabled={loading} type="submit">
          Update Email
        </button>
      </form>
      <form onSubmit={handleChangePassword} className="mb-6">
        <label className="block mb-2 font-semibold">Change Password</label>
        <input
          type="password"
          className="input input-bordered w-full mb-2"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
          required
        />
        <input
          type="password"
          className="input input-bordered w-full mb-2"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="New Password"
          required
        />
        <button className="btn btn-primary" disabled={loading} type="submit">
          Update Password
        </button>
      </form>
      <div className="mb-6">        <label className="block mb-2 font-semibold">Two-Factor Authentication (2FA)</label>
        {user?.is_2fa_enabled ? (
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium" 
            disabled={loading} 
            onClick={handle2FADisable} 
            type="button"
          >
            {loading ? 'Disabling...' : 'Disable 2FA'}
          </button>        ) : show2FASetup ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Set up Two-Factor Authentication
            </h3>
            
            {otpauthUrl && (
              <div className="space-y-4">
                {/* QR Code Section */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-100 shadow-sm">
                    <QRCode value={otpauthUrl} size={140} />
                  </div>
                  <p className="text-xs text-gray-600 text-center max-w-sm">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                </div>

                {/* Manual Entry Section */}
                {twoFASecret && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Can't scan? Enter this key manually:
                    </h4>
                    <div className="bg-white p-2 rounded border border-gray-300 font-mono text-xs text-gray-800 break-all select-all cursor-pointer hover:bg-gray-50 transition-colors">
                      {twoFASecret}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Click to select and copy the key above
                    </p>
                  </div>
                )}

                {/* Verification Form */}
                <div className="border-t border-gray-200 pt-4">
                  <form onSubmit={handle2FAVerify} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter verification code from your authenticator app:
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest font-mono"
                        value={twoFACode}
                        onChange={e => setTwoFACode(e.target.value)}
                        placeholder="000000"
                        required
                        pattern="[0-9]{6}"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        type="button"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        onClick={() => setShow2FASetup(false)}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={loading}
                      >
                        {loading ? 'Verifying...' : 'Enable 2FA'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>) : (
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium" 
            disabled={loading} 
            onClick={start2FASetup} 
            type="button"
          >
            {loading ? 'Setting up...' : 'Enable 2FA'}
          </button>        )}
      </div>

      {/* 2FA Disable Verification Modal */}
      {show2FADisable && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 mb-4">
              To disable 2FA, please enter your current 6-digit authentication code from your authenticator app.
            </p>
            
            <form onSubmit={confirmDisable2FA}>
              <div className="mb-4">
                <label htmlFor="disableTwoFACode" className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Code
                </label>
                <input
                  id="disableTwoFACode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={disableTwoFACode}
                  onChange={(e) => setDisableTwoFACode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={cancelDisable2FA}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || disableTwoFACode.length !== 6}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {loading ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
