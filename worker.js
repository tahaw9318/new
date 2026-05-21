export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers for development (adjust for production)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routes
    if (path.startsWith('/api/')) {
      try {
        // GET /api/items - Get all items
        if (path === '/api/items' && method === 'GET') {
          const result = await env.DB.prepare(
            'SELECT * FROM items ORDER BY created_at DESC'
          ).all();
          
          return new Response(JSON.stringify(result.results), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // POST /api/items - Create new item
        if (path === '/api/items' && method === 'POST') {
          const { title, description } = await request.json();
          
          if (!title) {
            return new Response(
              JSON.stringify({ error: 'Title is required' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const result = await env.DB.prepare(
            'INSERT INTO items (title, description) VALUES (?, ?) RETURNING *'
          ).bind(title, description || '').first();
          
          return new Response(JSON.stringify(result), {
            status: 201,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // DELETE /api/items/:id - Delete item
        if (path.match(/^\/api\/items\/\d+$/) && method === 'DELETE') {
          const id = parseInt(path.split('/').pop());
          
          const result = await env.DB.prepare(
            'DELETE FROM items WHERE id = ? RETURNING *'
          ).bind(id).first();
          
          if (!result) {
            return new Response(
              JSON.stringify({ error: 'Item not found' }),
              { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // GET /api/items/:id - Get single item
        if (path.match(/^\/api\/items\/\d+$/) && method === 'GET') {
          const id = parseInt(path.split('/').pop());
          
          const item = await env.DB.prepare(
            'SELECT * FROM items WHERE id = ?'
          ).bind(id).first();
          
          if (!item) {
            return new Response(
              JSON.stringify({ error: 'Item not found' }),
              { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }
          
          return new Response(JSON.stringify(item), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        // 404 for API routes
        return new Response(
          JSON.stringify({ error: 'API endpoint not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } catch (error) {
        console.error('API Error:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // Serve HTML for root path
    if (path === '/' || path === '/index.html') {
      const html = await fetchHTML();
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // 404 for other routes
    return new Response('Not Found', { status: 404 });
  },
};

// Helper function to serve HTML (in production, you'd serve from a CDN or assets)
async function fetchHTML() {
  // In a real deployment, you could import the HTML as a string
  // For now, we'll return a placeholder - you'll need to embed the HTML
  return `<!DOCTYPE html>
<html>
<head>
    <title>Cloudflare Worker + D1</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div id="root"></div>
    <script>
        // Your HTML content here
        // For production, embed the index.html content or serve from R2
        document.getElementById('root').innerHTML = '<h1>Loading...</h1>';
        fetch('/');
    </script>
</body>
</html>`;
}
