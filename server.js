const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();

app.use(express.json({ limit: "15mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    version: "8.0.0",
    ai: !!process.env.OPENAI_API_KEY
  });
});

app.post("/api/login", (req, res) => {
  const configured = process.env.APP_PASSWORD;

  if (!configured) {
    return res.json({ ok: true });
  }

  res.json({
    ok: req.body.password === configured
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY ontbreekt"
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = (req.body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt ontbreekt"
      });
    }

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });

    const image = result.data?.[0];

    res.json({
      image: image?.b64_json
        ? `data:image/png;base64,${image.b64_json}`
        : image?.url
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message || "Genereren mislukt"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`WAISI RealWear Studio v8 draait op poort ${PORT}`);
});
