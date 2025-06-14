
export default async function handler(req, res) {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";
  const resp = await fetch(url);
  if (!resp.ok) return res.status(500).json({ error: "Failed to fetch prices" });
  const data = await resp.json();
  // Flatten output for easier use
  data.bitcoin.usd_24h_change = data.bitcoin.usd_24h_change || data.bitcoin.usd_24h_change || 0;
  data.ethereum.usd_24h_change = data.ethereum.usd_24h_change || data.ethereum.usd_24h_change || 0;
  res.json(data);
}
