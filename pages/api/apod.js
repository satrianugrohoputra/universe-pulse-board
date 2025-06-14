
export default async function handler(req, res) {
  const NASA_API_KEY = process.env.NASA_API_KEY;
  const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
  const resp = await fetch(url);
  if (!resp.ok) return res.status(500).json({ error: "Failed to fetch APOD" });
  const data = await resp.json();
  res.json(data);
}
