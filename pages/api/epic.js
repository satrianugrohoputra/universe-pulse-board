
export default async function handler(req, res) {
  const NASA_API_KEY = process.env.NASA_API_KEY;
  const url = `https://api.nasa.gov/EPIC/api/natural/images?api_key=${NASA_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) return res.status(500).json({ error: "Failed to fetch EPIC" });
  const data = await resp.json();
  res.json(data);
}
