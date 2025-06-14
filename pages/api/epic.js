
export default async function handler(req, res) {
  // Hardcode NASA API key
  const NASA_API_KEY = "tBkTBc95GoLSAScjXeOIdxDjAbASfuR9b6M8oBCR";
  const url = `https://api.nasa.gov/EPIC/api/natural/images?api_key=${NASA_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) return res.status(500).json({ error: "Failed to fetch EPIC" });
  const data = await resp.json();
  res.json(data);
}
