import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

function getGenAI(customKey?: string) {
  const apiKey = customKey?.trim() || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please configure it in AI Studio or provide a custom key in Settings.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Support up to 25MB for image uploads
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Meal photo and text analysis endpoint
  app.post("/api/analyze-meal", async (req, res) => {
    try {
      const { image, mimeType = "image/jpeg", promptText } = req.body;

      if (!image && !promptText) {
        return res.status(400).json({
          error: "Please provide a meal photo or a text description of the meal.",
        });
      }

      const customApiKey = req.headers["x-gemini-api-key"] as string | undefined;
      const selectedModel = (req.headers["x-gemini-model"] as string) || "gemini-2.5-flash";
      const ai = getGenAI(customApiKey);

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (image) {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = image.includes(",") ? image.split(",")[1] : image;
        parts.push({
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanBase64,
          },
        });
      }

      let promptInstruction = "";
      if (image) {
        promptInstruction = `You are a nutrition vision expert for rapid calorie and protein tracking.
Analyze the meal photo.${promptText ? ` User note: "${promptText}".` : ""}
1. Identify the dish and individual food components.
2. Estimate serving portions realistically.
3. Calculate Calories (kcal) and Protein (grams) accurately.
4. Estimate Carbs (g) and Fat (g).
5. Output valid JSON.`;
      } else {
        promptInstruction = `You are an expert nutritional estimation AI.
The user described their meal: "${promptText}".
Analyze this meal description (supporting all Indian and global dietary items like roti, dal, sabzi, chicken, almonds, bananas, chole, chana, bhindi, karela, protein shakes, rice, etc.):
1. Identify the meal name and categorize type (breakfast/lunch/dinner/snack).
2. Calculate total Calories (kcal) and total Protein (grams) based on standard portion weights.
3. Estimate Carbs (g) and Fat (g).
4. List individual items with portion and calories/protein breakdown.
5. Provide a quick 1-sentence nutritional takeaway.
Output valid JSON.`;
      }

      parts.push({ text: promptInstruction });

      let response;
      const generateConfig = {
        systemInstruction:
          "You are a precise nutritional calculator AI. Return accurate caloric and macronutrient numbers (specifically Calories and Protein) in strict JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealName: {
              type: Type.STRING,
              description: "Concise title of the meal (e.g., 'Pan-seared Salmon & Steamed Broccoli')",
            },
            mealType: {
              type: Type.STRING,
              description: "breakfast, lunch, dinner, snack, or other",
            },
            calories: {
              type: Type.NUMBER,
              description: "Total estimated calories in kcal (integer)",
            },
            protein: {
              type: Type.NUMBER,
              description: "Total estimated protein in grams (integer or 1 decimal)",
            },
            carbs: {
              type: Type.NUMBER,
              description: "Total estimated carbohydrates in grams",
            },
            fat: {
              type: Type.NUMBER,
              description: "Total estimated fats in grams",
            },
            items: {
              type: Type.ARRAY,
              description: "List of identified individual food items",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of food component" },
                  portion: { type: Type.STRING, description: "Estimated portion (e.g. 150g, 1 cup)" },
                  calories: { type: Type.NUMBER, description: "Calories for this item" },
                  protein: { type: Type.NUMBER, description: "Protein in grams for this item" },
                },
                required: ["name", "portion", "calories", "protein"],
              },
            },
            nutritionalTakeaway: {
              type: Type.STRING,
              description: "Short 1-sentence insight (especially relevant for night/evening or macro balance)",
            },
            confidence: {
              type: Type.STRING,
              description: "high, medium, or low",
            },
          },
          required: ["mealName", "mealType", "calories", "protein", "items"],
        },
      };

      try {
        response = await ai.models.generateContent({
          model: selectedModel,
          contents: parts,
          config: generateConfig,
        });
      } catch (primaryErr) {
        if (selectedModel !== "gemini-2.5-flash") {
          console.warn(`Model "${selectedModel}" failed, falling back to gemini-2.5-flash:`, primaryErr);
          response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: parts,
            config: generateConfig,
          });
        } else {
          throw primaryErr;
        }
      }

      const responseText = response.text?.trim() || "{}";
      const result = JSON.parse(responseText);

      return res.json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      console.error("AI Analysis error:", err);
      const message = err instanceof Error ? err.message : "Failed to analyze meal image";
      return res.status(500).json({
        error: message,
      });
    }
  });

  // Dedicated AI & Web Nutrient Detail Fetcher for Custom Foods & Dishes
  app.post("/api/fetch-food-nutrition", async (req, res) => {
    try {
      const { foodName, requestedUnit } = req.body;

      if (!foodName || typeof foodName !== "string" || !foodName.trim()) {
        return res.status(400).json({
          error: "Please provide a food or dish name to fetch nutrition details.",
        });
      }

      const customApiKey = req.headers["x-gemini-api-key"] as string | undefined;
      const selectedModel = (req.headers["x-gemini-model"] as string) || "gemini-2.5-flash";
      const ai = getGenAI(customApiKey);

      const prompt = `You are an expert nutritional database search engine and nutrition science specialist.
The user wants verified nutrient details for: "${foodName.trim()}".
${requestedUnit ? `Requested measurement unit: "${requestedUnit}".` : ""}

Task:
1. Identify the dish, recipe, or food ingredient (support all Indian dishes, fitness foods, global staples, snacks, homemade curries, etc.).
2. Determine the most practical default measurement unit: "piece", "gram", "bowl", "cup", "scoop", "serving", "litre", or "ml".
3. Provide exact, scientifically accurate macronutrient and caloric values for 1 UNIT of this measurement.
   - Calories (kcal)
   - Protein (grams)
   - Carbohydrates (grams)
   - Fat (grams)
   - Approximate weight in grams for 1 unit (gramsPerUnit, e.g. 1 almond = 1.2g, 1 piece chapati = 40g, 1 bowl dal = 150g, 1 scoop whey = 30g).
4. Provide Hindi / local name if it is an Indian item.
5. Provide a brief explanation of the portion (e.g., "1 bowl / katori (approx 150g)").
Output strict JSON matching the schema.`;

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: [{ text: prompt }],
        config: {
          systemInstruction:
            "You are a verified nutritional reference API. Return exact standard caloric and macronutrient numbers in strict JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Clean standard name of the food (e.g. 'Paneer Tikka')",
              },
              hindiName: {
                type: Type.STRING,
                description: "Hindi name or Devanagari translation if applicable (e.g. 'पनीर टिक्का')",
              },
              category: {
                type: Type.STRING,
                description: "One of: cooked_dishes, proteins, staples, nuts_seeds, fruits, dairy, or snack",
              },
              defaultUnit: {
                type: Type.STRING,
                description: "One of: piece, gram, bowl, cup, scoop, serving, litre, ml",
              },
              caloriesPerUnit: {
                type: Type.NUMBER,
                description: "Calories (kcal) for 1 unit (integer or 1 decimal)",
              },
              proteinPerUnit: {
                type: Type.NUMBER,
                description: "Protein (g) for 1 unit (1 decimal precision)",
              },
              carbsPerUnit: {
                type: Type.NUMBER,
                description: "Carbohydrates (g) for 1 unit (1 decimal precision)",
              },
              fatPerUnit: {
                type: Type.NUMBER,
                description: "Fats (g) for 1 unit (1 decimal precision)",
              },
              gramsPerUnit: {
                type: Type.NUMBER,
                description: "Estimated weight in grams of 1 unit",
              },
              portionExplanation: {
                type: Type.STRING,
                description: "Clear portion description (e.g. '1 medium piece (approx 45g)')",
              },
            },
            required: [
              "name",
              "defaultUnit",
              "caloriesPerUnit",
              "proteinPerUnit",
              "carbsPerUnit",
              "fatPerUnit",
            ],
          },
        },
      });

      const responseText = response.text?.trim() || "{}";
      const result = JSON.parse(responseText);

      return res.json({
        success: true,
        data: result,
      });
    } catch (err: unknown) {
      console.error("Fetch food nutrition error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to fetch nutrition from AI/web";
      return res.status(500).json({
        error: message,
      });
    }
  });

  // Endpoint to test custom or selected Gemini model
  app.post("/api/test-gemini-model", async (req, res) => {
    try {
      const customApiKey = req.headers["x-gemini-api-key"] as string | undefined;
      const modelToTest = (req.body?.model || req.headers["x-gemini-model"] || "gemini-2.5-flash") as string;
      const ai = getGenAI(customApiKey);

      const response = await ai.models.generateContent({
        model: modelToTest.trim(),
        contents: [{ text: "Hello! Return a 3-word status confirmation like 'Connection is active'." }],
      });

      return res.json({
        success: true,
        model: modelToTest.trim(),
        message: response.text?.trim() || "Model connected successfully",
      });
    } catch (err: unknown) {
      console.warn("Test Gemini model failed:", err);
      const message = err instanceof Error ? err.message : "Model connection failed";
      return res.status(400).json({
        success: false,
        error: message,
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup error:", err);
});
