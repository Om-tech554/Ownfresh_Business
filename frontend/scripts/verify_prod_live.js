async function testProd() {
  const urls = [
    'https://myownfresh.com/blog/what-is-kachi-ghani-oil',
    'https://myownfresh.com/blog/traditional-kachi-ghani-oils',
    'https://myownfresh.com/blog/choosing-the-right-cooking-oil-matters-child-health',
    'https://myownfresh.com/blog/smart-indian-cooking-oils-blood-sugar-control',
    'https://myownfresh.com/blog/omega-3-and-omega-6-in-cooking-oils',
    'https://myownfresh.com/blog/boost-immunity-natural-cooking-oils-indian-kitchen',
    'https://myownfresh.com/blog/non-existing-slug-test-12345',
    'https://myownfresh.com/this-page-does-not-exist-test-xyz',
    'https://myownfresh.com/sitemap.xml',
    'https://myownfresh.com/robots.txt'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      const text = await res.text();
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      const canonicalMatch = text.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
      const h1Match = text.match(/<h1[^>]*>(.*?)<\/h1>/i);
      const hasSchema = text.includes('BlogPosting') || text.includes('schema.org');
      console.log('---');
      console.log('URL:', url);
      console.log('Status:', res.status);
      console.log('Title:', titleMatch ? titleMatch[1] : 'NONE');
      console.log('Canonical:', canonicalMatch ? canonicalMatch[1] : 'NONE');
      console.log('H1:', h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'NONE');
      console.log('Body Length:', text.length, 'Has Schema:', hasSchema);
    } catch (e) {
      console.log('URL:', url, 'Error:', e.message);
    }
  }
}
testProd();
