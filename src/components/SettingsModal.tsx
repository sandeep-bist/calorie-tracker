import React, { useState } from "react";
import {
  X,
  Flame,
  Dumbbell,
  Check,
  RotateCcw,
  Apple,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Cpu,
  Droplets,
} from "lucide-react";
import { DailyTargets } from "../types";
import {
  DEFAULT_TARGETS,
  loadStoredApiKey,
  saveStoredApiKey,
  loadStoredModel,
  saveStoredModel,
  AVAILABLE_GEMINI_MODELS,
} from "../utils/storage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targets: DailyTargets;
  onSaveTargets: (newTargets: DailyTargets) => void;
  onOpenIOSModal: () => void;
}

const PRESETS = [
  { name: "High Protein / Cut", calories: 1900, protein: 160, water: 3000 },
  { name: "Muscle Building", calories: 2600, protein: 180, water: 3500 },
  { name: "Lean Maintenance", calories: 2200, protein: 140, water: 3000 },
  { name: "Night Shift Focus", calories: 2000, protein: 150, water: 2500 },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  targets,
  onSaveTargets,
  onOpenIOSModal,
}) => {
  const [calories, setCalories] = useState<number>(targets.calories);
  const [protein, setProtein] = useState<number>(targets.protein);
  const [waterTarget, setWaterTarget] = useState<number>(targets.waterTarget || 3000);

  // Gemini API Key & Model selection state
  const [apiKey, setApiKey] = useState<string>(() => loadStoredApiKey());
  const initialStoredModel = loadStoredModel();
  const isPredefined = AVAILABLE_GEMINI_MODELS.some((m) => m.id === initialStoredModel);
  const [selectedModel, setSelectedModel] = useState<string>(() => initialStoredModel);
  const [isCustomModel, setIsCustomModel] = useState<boolean>(!isPredefined);
  const [customModelInput, setCustomModelInput] = useState<string>(() =>
    !isPredefined ? initialStoredModel : ""
  );
  const [showKey, setShowKey] = useState<boolean>(false);
  const [configSavedToast, setConfigSavedToast] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getEffectiveModel = () => {
    if (isCustomModel) {
      return customModelInput.trim() || "gemini-2.5-flash";
    }
    return selectedModel;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveTargets({
      ...targets,
      calories: Number(calories) || DEFAULT_TARGETS.calories,
      protein: Number(protein) || DEFAULT_TARGETS.protein,
      waterTarget: Number(waterTarget) || DEFAULT_TARGETS.waterTarget || 3000,
    });
    // Save API key & model
    saveStoredApiKey(apiKey);
    saveStoredModel(getEffectiveModel());
    onClose();
  };

  const applyPreset = (preset: { calories: number; protein: number; water?: number }) => {
    setCalories(preset.calories);
    setProtein(preset.protein);
    if (preset.water) setWaterTarget(preset.water);
  };

  const handleSaveAIConfig = () => {
    saveStoredApiKey(apiKey);
    saveStoredModel(getEffectiveModel());
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2500);
  };

  const handleClearApiKey = () => {
    setApiKey("");
    saveStoredApiKey("");
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2000);
  };

  const handleTestModelConnection = async () => {
    const modelToTest = getEffectiveModel();
    setTestStatus("testing");
    setTestMessage(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey.trim()) headers["x-gemini-api-key"] = apiKey.trim();
      headers["x-gemini-model"] = modelToTest;

      const res = await fetch("/api/test-gemini-model", {
        method: "POST",
        headers,
        body: JSON.stringify({ model: modelToTest }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setTestStatus("success");
        setTestMessage(`"${modelToTest}" is active & responding!`);
      } else {
        setTestStatus("error");
        setTestMessage(
          json.error || `Model "${modelToTest}" failed. You can switch to Gemini 2.5 Flash.`
        );
      }
    } catch {
      setTestStatus("error");
      setTestMessage("Network request failed. Check API key or connection.");
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 safe-bottom"
    >
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-white">
              App Preferences & AI Engine
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gemini Model & API Key Configuration Section */}
        <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">
                  Gemini AI Model & Key
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {apiKey.trim()
                    ? "Custom key active"
                    : "Using built-in server Gemini"}
                </span>
              </div>
            </div>
            {configSavedToast && (
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved!
              </span>
            )}
          </div>

          {/* Model Selector Cards */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block flex items-center gap-1">
                <Cpu className="w-3 h-3 text-sky-400" />
                Select Gemini Model
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomModel(!isCustomModel);
                  setTestStatus("idle");
                  setTestMessage(null);
                }}
                className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                {isCustomModel ? "Pick Standard Model" : "+ Input Custom Model"}
              </button>
            </div>

            {!isCustomModel ? (
              <div className="space-y-1.5">
                {AVAILABLE_GEMINI_MODELS.map((m) => {
                  const isSelected = selectedModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id);
                        setTestStatus("idle");
                        setTestMessage(null);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start justify-between ${
                        isSelected
                          ? "bg-neutral-900 border-emerald-500 shadow-sm"
                          : "bg-black/60 border-neutral-800/80 hover:border-neutral-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-white font-mono">
                            {m.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                              isSelected
                                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                : "bg-neutral-800 text-neutral-400 border-neutral-700"
                            }`}
                          >
                            {m.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                          {m.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Custom Model Input Option */
              <div className="p-3 rounded-xl bg-black/80 border border-emerald-500/50 space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Custom AI Model Identifier
                    </span>
                    <span className="text-[9px] font-mono text-neutral-500">
                      e.g. gemini-1.5-flash
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter any Gemini model ID (e.g. gemini-1.5-flash, gemini-2.0-flash)"
                    value={customModelInput}
                    onChange={(e) => {
                      setCustomModelInput(e.target.value);
                      setTestStatus("idle");
                      setTestMessage(null);
                    }}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick Model ID Presets */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-neutral-500">
                    Quick suggestions in case given model is unavailable:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"].map(
                      (presetId) => (
                        <button
                          key={presetId}
                          type="button"
                          onClick={() => {
                            setCustomModelInput(presetId);
                            setTestStatus("idle");
                            setTestMessage(null);
                          }}
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                            customModelInput === presetId
                              ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          {presetId}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="text-[9px] font-mono text-neutral-500">
                  🛡️ Auto-Recovery: If your custom model fails, the app automatically falls back to Gemini 2.5 Flash so your logging is never interrupted.
                </div>
              </div>
            )}

            {/* Test Connection Button & Status */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                disabled={testStatus === "testing"}
                onClick={handleTestModelConnection}
                className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-700/60 text-sky-300 text-[10px] font-mono font-semibold flex items-center gap-1 active:scale-95 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                <span>
                  {testStatus === "testing" ? "Testing Connection..." : "Test Model Connection"}
                </span>
              </button>

              <span className="text-[10px] font-mono text-neutral-500">
                Active: <span className="text-white font-semibold">{getEffectiveModel()}</span>
              </span>
            </div>

            {testMessage && (
              <div
                className={`p-2 rounded-lg text-[10px] font-mono border ${
                  testStatus === "success"
                    ? "bg-emerald-950/50 text-emerald-300 border-emerald-800/60"
                    : "bg-rose-950/50 text-rose-300 border-rose-800/60"
                }`}
              >
                {testMessage}
              </div>
            )}
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
              Personal Gemini API Key (Optional)
            </label>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                placeholder="AIzaSy... (leave blank to use system key)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-mono pr-16"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
              {apiKey.trim() ? (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="text-neutral-400 hover:text-red-400 transition-colors"
                >
                  Reset to System Key
                </button>
              ) : (
                <span className="text-neutral-500">System key ready</span>
              )}
              <button
                type="button"
                onClick={handleSaveAIConfig}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 transition-colors font-semibold"
              >
                Save Model & Key
              </button>
            </div>
          </div>
        </div>

        {/* Quick Goal Presets */}
        <div>
          <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
            Quick Goal Archetypes
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-colors"
              >
                <div className="text-xs font-semibold text-neutral-200">{p.name}</div>
                <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                  <span className="text-emerald-400">{p.calories} kcal</span> •{" "}
                  <span className="text-sky-400">{p.protein}g P</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Target Inputs */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Target Calories (kcal)
              </label>
              <input
                type="number"
                step="50"
                required
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Dumbbell className="w-3 h-3" />
                Target Protein (g)
              </label>
              <input
                type="number"
                step="5"
                required
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Daily Water Target */}
          <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" />
                Daily Water Target: {(waterTarget / 1000).toFixed(1)} Litres ({waterTarget} ml)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="250"
                min="500"
                max="8000"
                required
                value={waterTarget}
                onChange={(e) => setWaterTarget(Number(e.target.value))}
                className="flex-1 bg-black border border-neutral-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-xs text-neutral-400 font-mono">ml / day</span>
            </div>

            <div className="flex gap-1.5 pt-0.5">
              {[2000, 2500, 3000, 3500, 4000].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => setWaterTarget(ml)}
                  className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all ${
                    waterTarget === ml
                      ? "bg-cyan-950 border-cyan-500 text-cyan-300 font-bold"
                      : "bg-black border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {(ml / 1000).toFixed(1)}L
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setCalories(DEFAULT_TARGETS.calories);
                setProtein(DEFAULT_TARGETS.protein);
                setWaterTarget(DEFAULT_TARGETS.waterTarget || 3000);
              }}
              title="Reset defaults"
              className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold font-mono text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Save & Close</span>
            </button>
          </div>
        </form>

        {/* iOS App installation option */}
        <div className="pt-2 border-t border-neutral-900">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenIOSModal();
            }}
            className="w-full p-2.5 rounded-xl bg-neutral-900/40 hover:bg-neutral-900 border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-300 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Apple className="w-3.5 h-3.5 fill-current text-white" />
              <span className="font-mono text-[11px]">Install as iOS Native App (Guide)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">View →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
