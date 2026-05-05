export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  try {
    const NEWS_API_KEY  = process.env.NEWS_API_KEY;
    const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

    // ── Try GNews first (works on deployed domains, free tier) ──
    if (GNEWS_API_KEY) {
      const gRes  = await fetch(
        `https://gnews.io/api/v4/top-headlines?country=in&max=10&apikey=${GNEWS_API_KEY}`
      );
      const gData = await gRes.json();

      if (gData.articles?.length) {
        // Normalize to NewsAPI shape so frontend needs no changes
        return res.status(200).json({
          status: 'ok',
          totalResults: gData.totalArticles,
          articles: gData.articles.map(a => ({
            source:      { name: a.source?.name || 'Unknown' },
            title:       a.title,
            description: a.description,
            url:         a.url,
            urlToImage:  a.image,
            publishedAt: a.publishedAt,
          }))
        });
      }
    }

    // ── Fallback: NewsAPI (works on localhost dev only) ──
    if (!NEWS_API_KEY) {
      return res.status(500).json({
        error: 'No API key configured. Set GNEWS_API_KEY (recommended) or NEWS_API_KEY.'
      });
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=in&pageSize=10&apiKey=${NEWS_API_KEY}`
    );
    const data = await response.json();

    if (data.status === 'error') {
      return res.status(400).json({ error: data.message, code: data.code });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
