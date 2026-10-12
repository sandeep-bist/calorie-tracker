import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Check,
  Flame,
  Dumbbell,
  Plus,
  Minus,
  AlertCircle,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import { Meal, MealType, MealItem } from "../types";
import { compressImage } from "../utils/image";
import { loadStoredApiKey, loadStoredModel } from "../utils/storage";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogMeal: (meal: Omit<Meal, "id">) => void;
  selectedDate: string;
}

// Curated high-res food photo samples for instant testing without leaving the desk
const SAMPLE_TEST_PHOTOS = [
  {
    name: "Grilled Salmon & Quinoa",
    description: "Omega-3 rich salmon with green asparagus and fluffy quinoa",
    url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Ribeye Steak & Eggs",
    description: "Seared beef steak with sunny-side up pasture eggs",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Chicken Teriyaki Rice Bowl",
    description: "Grilled chicken breast, broccoli florets, and steamed rice",
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Greek Yogurt & Protein Berries",
    description: "Night-time high casein Greek yogurt with fresh berries and chia",
    url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
  },
];

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onLogMeal,
  selectedDate,
}) => {
  const [step, setStep] = useState<"camera" | "analyzing" | "review">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analyzingStatus, setAnalyzingStatus] = useState("Analyzing meal photo...");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Result state
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState<MealType>("dinner");
  const [calories, setCalories] = useState<number>(500);
  const [protein, setProtein] = useState<number>(35);
  const [carbs, setCarbs] = useState<number>(45);
  const [fat, setFat] = useState<number>(18);
  const [items, setItems] = useState<MealItem[]>([]);
  const [notes, setNotes] = useState("");
  const [userPrompt, setUserPrompt] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start / Stop live camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
      return;
    }

    if (step === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, step, facingMode]);

  const resetState = () => {
    setStep("camera");
    setCapturedImage(null);
    setCameraError(null);
    setAnalysisError(null);
    setUserPrompt("");
  };

  const startCamera = async () => {
    try {
      stopCamera();
      setCameraError(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API not supported in this browser. Please upload a photo.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn("Video play error:", err);
        });
      }
    } catch (err: unknown) {
      console.warn("Camera start failed:", err);
      setCameraError("Camera access denied or unavailable. Use file upload or test samples below.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Capture frame from video
  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    stopCamera();
    const compressed = await compressImage(rawDataUrl, 1200, 0.85);
    setCapturedImage(compressed);
    runAIAnalysis(compressed);
  };

  // Upload photo from device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      stopCamera();
      const compressed = await compressImage(file, 1200, 0.85);
      setCapturedImage(compressed);
      runAIAnalysis(compressed);
    } catch (err) {
      console.error("Image processing failed:", err);
      setAnalysisError("Failed to process selected image.");
    }
  };

  // Select sample photo
  const handleSelectSample = async (url: string) => {
    try {
      stopCamera();
      setCapturedImage(url);
      runAIAnalysis(url);
    } catch (err) {
      console.error("Sample select failed", err);
    }
  };

  // Trigger server-side AI Vision Analysis
  const runAIAnalysis = async (imageInput: string) => {
    setStep("analyzing");
    setAnalysisError(null);
    setAnalyzingStatus("Scanning visual food cues...");

    try {
      let base64Data = imageInput;

      // If image is a remote URL, fetch and convert to base64
      if (imageInput.startsWith("http")) {
        setAnalyzingStatus("Loading test meal photo...");
        const res = await fetch(imageInput);
        const blob = await res.blob();
        base64Data = await compressImage(blob, 1200, 0.85);
      }

      setAnalyzingStatus("Gemini AI estimating Calories & Protein...");

      const customKey = loadStoredApiKey();
      const customModel = loadStoredModel();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (customKey) {
        headers["x-gemini-api-key"] = customKey;
      }
      if (customModel) {
        headers["x-gemini-model"] = customModel;
      }

      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers,
        body: JSON.stringify({
          image: base64Data,
          promptText: userPrompt.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Failed to analyze meal" }));
        throw new Error(errData.error || `Analysis failed (${response.status})`);
      }

      const json = await response.json();
      const data = json.data;

      // Populate results
      setMealName(data.mealName || "Detected Meal");
      setMealType(normalizeMealType(data.mealType));
      setCalories(Math.round(data.calories || 450));
      setProtein(Math.round(data.protein || 30));
      setCarbs(Math.round(data.carbs || 35));
      setFat(Math.round(data.fat || 15));
      setItems(data.items || []);
      setNotes(data.nutritionalTakeaway || "");

      setStep("review");
    } catch (err: unknown) {
      console.error("AI Analysis error:", err);
      const msg = err instanceof Error ? err.message : "AI analysis encountered an error.";
      setAnalysisError(msg);
      // Even if AI call failed (e.g. offline or rate limit), allow user to manually confirm numbers
      setMealName("Logged Meal");
      setMealType("dinner");
      setCalories(500);
      setProtein(35);
      setItems([{ name: "Meal portion", portion: "1 plate", calories: 500, protein: 35 }]);
      setNotes("Manual adjustment enabled.");
      setStep("review");
    }
  };

  const normalizeMealType = (raw: string): MealType => {
    const lower = (raw || "").toLowerCase();
    const currentHour = new Date().getHours();

    if (currentHour >= 21 || currentHour < 5) return "night_bite";
    if (lower.includes("breakfast")) return "breakfast";
    if (lower.includes("lunch")) return "lunch";
    if (lower.includes("dinner")) return "dinner";
    if (lower.includes("night") || lower.includes("late")) return "night_bite";
    return "dinner";
  };

  const handleInstantLog = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timestamp = `${hours}:${minutes}`;

    onLogMeal({
      date: selectedDate,
      timestamp,
      name: mealName.trim() || "Analyzed Meal",
      mealType,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      items,
      imageUrl: capturedImage || undefined,
      notes: notes || undefined,
      aiAnalyzed: true,
    });

    onClose();
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between max-w-md mx-auto h-full overflow-hidden text-white font-sans select-none">
      {/* Top Header with Safe Area Inset and Prominent Back Button */}
      <div className="flex items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] border-b border-neutral-900 bg-neutral-950/95 z-20">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white font-mono text-xs active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">Back to Main</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono tracking-wider uppercase font-bold text-neutral-200">
            {step === "camera" && "Food Vision"}
            {step === "analyzing" && "Analyzing..."}
            {step === "review" && "Confirm Macros"}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close scanner"
          className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
        {/* STEP 1: CAMERA & PHOTO PICKER */}
        {step === "camera" && (
          <div className="flex-1 flex flex-col p-4 space-y-4">
            {/* Viewfinder Card */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
              {/* Video Stream */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${cameraError ? "hidden" : "block"}`}
              />

              {/* Viewfinder Target Reticle / High-contrast Brackets */}
              {!cameraError && (
                <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
                    <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-black/75 text-neutral-300 border border-neutral-800/80 backdrop-blur-sm">
                      Align food plate within frame
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
                    <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              )}

              {/* Camera Error or Fallback State */}
              {cameraError && (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                    <ImageIcon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-xs text-neutral-400">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold text-xs font-mono inline-flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Phone</span>
                  </button>
                </div>
              )}

              {/* Flip camera button */}
              {!cameraError && (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  title="Switch camera"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-neutral-700 text-white flex items-center justify-center backdrop-blur-md"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Camera Action Buttons */}
            <div className="flex items-center justify-around px-4 pt-1">
              {/* Upload from device */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center text-neutral-400 hover:text-white space-y-1"
              >
                <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono">Upload</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={Boolean(cameraError)}
                aria-label="Capture Meal Photo"
                className={`w-18 h-18 rounded-full p-1 border-2 transition-all flex items-center justify-center ${
                  cameraError
                    ? "opacity-40 cursor-not-allowed border-neutral-700"
                    : "border-emerald-400 hover:border-emerald-300 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                }`}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <Camera className="w-6 h-6 text-black" />
                </div>
              </button>

              {/* Context Hint */}
              <div className="flex flex-col items-center text-neutral-400 space-y-1">
                <div className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono">Gemini Vision</span>
              </div>
            </div>

            {/* Quick Optional Note / Context */}
            <div className="pt-2">
              <input
                type="text"
                placeholder="Optional notes (e.g. 'extra olive oil, double chicken')..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Test Sample Meals (Perfect for immediate testing in preview) */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 uppercase">
                <span>Or test sample meals instantly</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_TEST_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample.url)}
                    className="flex items-center space-x-2 p-2 rounded-xl bg-neutral-950 border border-neutral-900 hover:border-neutral-700 text-left transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                      <img
                        src={sample.url}
                        alt={sample.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate">
                        {sample.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono truncate">
                        Instant scan
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600 group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Prominent Bottom Cancel Button */}
            <div className="pt-2 pb-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-mono text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-neutral-400" />
                <span>Cancel & Return to Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ANALYZING ANIMATION */}
        {step === "analyzing" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
            {capturedImage && (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <img
                  src={capturedImage}
                  alt="Captured food"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {/* Visual laser scan sweep animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/30 to-transparent animate-pulse" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-bounce" />
              </div>
            )}

            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>AI Vision Engine Active</span>
              </div>
              <h3 className="text-base font-semibold text-white">
                {analyzingStatus}
              </h3>
              <p className="text-xs text-neutral-500 font-mono max-w-xs">
                Extracting calorie density, portion sizing, and exact protein grams.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & INSTANT CONFIRMATION */}
        {step === "review" && (
          <div className="flex-1 p-4 space-y-4">
            {analysisError && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{analysisError} - You can customize the values below.</span>
              </div>
            )}

            {/* Meal Header & Photo Preview */}
            <div className="flex items-start gap-3 bg-neutral-950 border border-neutral-900 rounded-2xl p-3">
              {capturedImage && (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 border border-neutral-800">
                  <img
                    src={capturedImage}
                    alt={mealName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                  Detected Meal Name
                </label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Primary Metrics: Calories & Protein */}
            <div className="grid grid-cols-2 gap-3">
              {/* Calories Box */}
              <div className="bg-neutral-950 border border-emerald-900/60 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Calories
                  </span>
                  <span className="text-[10px] text-neutral-500">kcal</span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCalories((prev) => Math.max(0, prev - 50))}
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center justify-center hover:bg-neutral-800 active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-20 text-center bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setCalories((prev) => prev + 50)}
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center justify-center hover:bg-neutral-800 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Protein Box */}
              <div className="bg-neutral-950 border border-sky-900/60 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-sky-400">
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5" />
                    Protein
                  </span>
                  <span className="text-[10px] text-neutral-500">grams</span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setProtein((prev) => Math.max(0, prev - 5))}
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center justify-center hover:bg-neutral-800 active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-16 text-center bg-transparent text-2xl font-bold font-mono text-white focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setProtein((prev) => prev + 5)}
                    className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 flex items-center justify-center hover:bg-neutral-800 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Meal Category */}
            <div>
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
                Log Under Meal Category
              </label>
              <div className="grid grid-cols-5 gap-1">
                {(["breakfast", "lunch", "dinner", "snack", "night_bite"] as MealType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setMealType(t)}
                    className={`text-[11px] font-mono py-1.5 rounded-lg border transition-all ${
                      mealType === t
                        ? "bg-emerald-950 border-emerald-500 text-emerald-300 font-bold"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    {t === "night_bite" ? "Night" : t.charAt(0).toUpperCase() + t.slice(1, 4)}
                  </button>
                ))}
              </div>
            </div>

            {/* Detected Items Breakdown */}
            {items.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Identified Food Portions
                </label>
                <div className="space-y-1">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-neutral-950 border border-neutral-900 font-mono"
                    >
                      <div className="text-neutral-200">
                        <span>{item.name}</span>
                        {item.portion && (
                          <span className="text-neutral-500 ml-1.5">({item.portion})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-neutral-400">
                        <span className="text-emerald-400 font-medium">{item.calories} kcal</span>
                        <span className="text-sky-400 font-medium">{item.protein}g P</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Takeaway / Note */}
            {notes && (
              <div className="text-xs text-neutral-300 bg-neutral-950 border border-neutral-900 rounded-xl p-3 font-mono italic flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{notes}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 border-t border-neutral-900 bg-black/95">
        {step === "review" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep("camera")}
              className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-mono transition-colors"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={handleInstantLog}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold font-mono text-sm flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Log Meal Instantly</span>
            </button>
          </div>
        ) : (
          <p className="text-center text-[10px] font-mono text-neutral-500">
            High-contrast visual scanning optimized for night use
          </p>
        )}
      </div>
    </div>
  );
};
