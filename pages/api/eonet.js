
export default async function handler(req, res) {
  const url = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open";
  const resp = await fetch(url);
  if (!resp.ok) return res.status(500).json({ error: "Failed to fetch events" });
  const data = await resp.json();
  res.json(data);
}
