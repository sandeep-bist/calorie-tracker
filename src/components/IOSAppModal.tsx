import React, { useState } from "react";
import {
  X,
  Smartphone,
  Share,
  PlusSquare,
  Sparkles,
  Check,
  Terminal,
  Copy,
  ExternalLink,
  Apple
} from "lucide-react";

interface IOSAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSAppModal: React.FC<IOSAppModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"homescreen" | "appstore">("homescreen");
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  if (!isOpen) return null;

  const capacitorCommands = `# 1. Install Capacitor iOS tools
npm install @capacitor/core @capacitor/ios
npm install -D @capacitor/cli

# 2. Initialize Capacitor
npx cap init "MacroScan" "com.macroscan.tracker" --web-dir dist

# 3. Build Web Bundle and Add iOS platform
npm run build
npx cap add ios

# 4. Open in Xcode for Simulator or App Store release
npx cap open ios`;

  const handleCopy = () => {
    navigator.clipboard.writeText(capacitorCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
              <Apple className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-white block">
                iOS App Options
              </span>
              <span className="text-[10px] text-neutral-400">
                Run natively on your iPhone & iPad
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

        {/* Tab selection */}
        <div className="grid grid-cols-2 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("homescreen")}
            className={`py-2 rounded-lg font-semibold transition-all ${
              activeTab === "homescreen"
                ? "bg-black text-emerald-400 shadow-sm border border-neutral-800"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            1. Instant iOS PWA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("appstore")}
            className={`py-2 rounded-lg font-semibold transition-all ${
              activeTab === "appstore"
                ? "bg-black text-sky-400 shadow-sm border border-neutral-800"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            2. App Store (Xcode)
          </button>
        </div>

        {activeTab === "homescreen" ? (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 text-xs text-neutral-300 space-y-1">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Zero Download • Instant Native Experience
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                You can install this app directly onto your iPhone home screen in under 10 seconds. It runs in standalone fullscreen without Safari's browser address bar, has full camera access, and uses OLED black styling.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                  1
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Open in Safari</span>
                  <span className="text-[11px] text-neutral-400">
                    Open this app link in Apple Safari on your iPhone or iPad.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                  2
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white flex items-center gap-1">
                    Tap the Share Button <Share className="w-3.5 h-3.5 text-sky-400 inline" />
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    In the Safari bottom navigation bar, tap the square Share icon with the arrow pointing up.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                  3
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white flex items-center gap-1">
                    Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Scroll down in the action sheet and tap <strong>Add to Home Screen</strong>.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                  4
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Tap "Add" in Top-Right</span>
                  <span className="text-[11px] text-neutral-400">
                    Confirm the name "MacroScan" and tap Add. It will be placed on your iOS home screen!
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold font-mono text-xs transition-all active:scale-[0.98]"
            >
              Got It
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-sky-950/30 border border-sky-900/50 text-xs text-neutral-300 space-y-1">
              <div className="font-semibold text-sky-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Package for Apple App Store (Xcode)
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                This app is architected with modern React and Tailwind. You can wrap it using <strong>Capacitor iOS</strong> in minutes to build a native Xcode project and distribute on TestFlight or the iOS App Store.
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-t-xl border border-b-0 border-neutral-800">
                <span>Terminal Setup Commands</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
                >
                  {copiedCmd ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 bg-black border border-neutral-800 rounded-b-xl text-[11px] font-mono text-neutral-300 overflow-x-auto whitespace-pre leading-relaxed">
                {capacitorCommands}
              </pre>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 text-[11px] text-neutral-400 space-y-1.5">
              <div className="font-semibold text-white">Native Features Automatically Maintained:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-neutral-400">
                <li>Instant camera capture & photo picker permissions</li>
                <li>Haptic feedback & native iOS gesture navigation</li>
                <li>Dark Mode status bar style & OLED contrast compliance</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
