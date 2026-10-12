import React, { useState } from "react";
import {
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  Sparkles,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Share2,
} from "lucide-react";
import { User, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onOpenShareModal: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenShareModal,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const msg = err instanceof Error ? err.message : "Unable to sign in. Please try again.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
              <Cloud className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-white block">
                {user ? "Account & Cloud Sync" : "Sign In & Cloud Account"}
              </span>
              <span className="text-[10px] text-neutral-400">
                {user ? "Your data is backed up to Firestore" : "Keep meals synced across your devices"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {user ? (
          /* User Profile View */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center space-x-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Avatar"}
                  className="w-11 h-11 rounded-full border border-emerald-500/50 object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold font-mono">
                  {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {user.displayName || "MacroScan Athlete"}
                </div>
                <div className="text-xs text-neutral-400 truncate font-mono">
                  {user.email}
                </div>
                <div className="flex items-center space-x-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                    Live Cloud Sync Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Share action button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShareModal();
              }}
              className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-mono text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Share App / Daily Stats</span>
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-900/60 text-red-300 font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>{loading ? "Signing out..." : "Sign Out"}</span>
            </button>
          </div>
        ) : (
          /* Sign In View */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-2 text-xs">
              <div className="font-semibold text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Why create an account?</span>
              </div>
              <ul className="space-y-1.5 text-neutral-300 text-[11px]">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sync all logged meals and targets across iPhone & Android</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Never lose your calorie & protein history when clearing cache</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>100% private: Isolated with strict zero-trust Firestore security</span>
                </li>
              </ul>
            </div>

            {/* Google One-Tap Sign In Button */}
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-black font-semibold text-xs flex items-center justify-center space-x-2.5 transition-all active:scale-[0.98] shadow-lg"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? "Signing in..." : "Continue with Google (Instant)"}</span>
            </button>

            <p className="text-[10px] text-center text-neutral-500 font-mono">
              Guest entries will automatically transfer to your account once logged in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
