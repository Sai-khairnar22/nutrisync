import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Lazy-initialize so dotenv is loaded first
const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/ai/diet-plan
router.post("/diet-plan", async (req, res) => {
  const {
    bioData,
    hostellerMode,
    hostelMenu,
    budget,
    dietaryPreference,
    availableFood,
  } = req.body;

  const systemPrompt = `You are a high-performance metabolic nutritionist AI. Generate a 1-day diet plan.
Return ONLY valid JSON, no explanation, no markdown, no extra text.
Format:
{
  "plan": [
    {
      "meal": "Breakfast",
      "items": ["item 1", "item 2"],
      "calories": 450,
      "macros": { "protein": 30, "carbs": 50, "fats": 15 },
      "rationale": "Scientific reason"
    }
  ],
  "daily_summary": "Short metabolic summary"
}`;

  const userPrompt = `Create my optimal diet plan with these constraints:
- Heart Rate: ${bioData?.hr || 77} BPM
- Blood Pressure: ${bioData?.bp || "120/80"}
- SpO2: ${bioData?.spo2 || 98}%
- Calories consumed today: ${bioData?.energy || 0}
- Remaining Protein: ${(bioData?.macros?.protein?.target || 120) - (bioData?.macros?.protein?.current || 0)}g
- Remaining Fats: ${(bioData?.macros?.fats?.target || 60) - (bioData?.macros?.fats?.current || 0)}g
- Hosteller Mode: ${hostellerMode ? "YES" : "NO"}
${hostellerMode && hostelMenu ? `- Hostel Mess Menu: ${hostelMenu}` : ""}
- Daily Budget: Rs.${budget || 500}
- Dietary Preference: ${dietaryPreference || "Veg"}
- Available Food: ${availableFood || "Not specified"}

Adjust food suggestions based on vitals. Return ONLY JSON.`;

  try {
    const completion = await getGroq().chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (error) {
    console.error("Diet plan error:", error);
    res.status(500).json({ error: "Failed to generate diet plan" });
  }
});

// POST /api/ai/analyze-food
router.post("/analyze-food", async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Image data required" });
  }

  const systemPrompt = `You are a food nutrition analyzer. Analyze the food in the image and return ONLY valid JSON.
Format:
{
  "food_name": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "metabolic_impact": "string describing health impact"
}
No markdown, no explanation, just JSON.`;

  try {
    // Groq supports vision with llama models
    const completion = await getGroq().chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: "Analyze the nutritional content of this food image. Return ONLY JSON.",
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (error) {
    console.error("Food analysis error:", error);
    // Fallback: return estimated data if vision fails
    res.status(500).json({ error: "Failed to analyze food image" });
  }
});

export default router;
