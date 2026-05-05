export default async function handler(req, res) {
  // Prevent Vercel / browser from caching this response
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  try {
    const API_KEY = process.env.NEWS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'NEWS_API_KEY is not set' });
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&pageSize=10&apiKey=${API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'error') {
      return res.status(400).json({ error: data.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
