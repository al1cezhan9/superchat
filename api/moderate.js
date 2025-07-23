// api/moderate.js
import Filter from 'bad-words';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, uid } = req.body;

  const filter = new Filter();

  if (filter.isProfane(text)) {
    const cleaned = filter.clean(text);
    return res.status(200).json({
      moderated: true,
      cleaned: `🤐 I'm done for... ${cleaned}`,
      ban: true
    });
  }

  return res.status(200).json({ moderated: false });
}
