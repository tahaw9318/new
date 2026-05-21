// Worker entry point
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS for frontend requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // API routes - forward to Durable Object
    if (url.pathname.startsWith("/api/")) {
      const id = env.MyDatabase.idFromName("main");
      const obj = env.MyDatabase.get(id);
      return obj.fetch(request);
    }

    // Serve HTML page for root route
    if (url.pathname === "/" || url.pathname === "") {
      const html = getHTML();
      return new Response(html, {
        headers: { 
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*"
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};

// Durable Object for data storage
export class MyDatabase {
  constructor(state, env) {
    this.storage = state.storage;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS headers for responses
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    // Handle preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /api/list - Retrieve all entries
    if (url.pathname === "/api/list" && method === "GET") {
      try {
        const entries = await this.storage.list();
        const data = [];
        for (const [key, value] of entries) {
          data.push({
            id: key,
            name: value.name,
            email: value.email,
            timestamp: value.timestamp || new Date().toISOString()
          });
        }
        // Sort by timestamp (newest first)
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return new Response(JSON.stringify(data), {
          headers: corsHeaders,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // POST /api/add - Add new entry
    if (url.pathname === "/api/add" && method === "POST") {
      try {
        const { name, email } = await request.json();
        
        // Validation
        if (!name || !email) {
          return new Response(JSON.stringify({ error: "Name and email are required" }), {
            status: 400,
            headers: corsHeaders,
          });
        }
        
        // Generate unique ID
        const id = Date.now().toString() + "_" + Math.random().toString(36).substr(2, 6);
        
        // Store data
        await this.storage.put(id, {
          name: name,
          email: email,
          timestamp: new Date().toISOString()
        });
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: "Added successfully",
          id: id 
        }), {
          status: 201,
          headers: corsHeaders,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // DELETE /api/delete/:id - Delete an entry
    if (url.pathname.startsWith("/api/delete/") && method === "DELETE") {
      try {
        const id = url.pathname.split("/").pop();
        await this.storage.delete(id);
        
        return new Response(JSON.stringify({ success: true, message: "Deleted successfully" }), {
          headers: corsHeaders,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // GET /api/get/:id - Get single entry
    if (url.pathname.startsWith("/api/get/") && method === "GET") {
      try {
        const id = url.pathname.split("/").pop();
        const entry = await this.storage.get(id);
        
        if (!entry) {
          return new Response(JSON.stringify({ error: "Entry not found" }), {
            status: 404,
            headers: corsHeaders,
          });
        }
        
        return new Response(JSON.stringify({ id, ...entry }), {
          headers: corsHeaders,
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }
}

// HTML Frontend
function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Durable Object Database Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .header p {
            opacity: 0.9;
        }

        .content {
            padding: 40px;
        }

        .form-section {
            background: #f7f9fc;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }

        .form-section h2 {
            margin-bottom: 20px;
            color: #333;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }

        input:focus {
            outline: none;
            border-color: #667eea;
        }

        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }

        button:hover {
            transform: translateY(-2px);
        }

        .data-section {
            background: #f7f9fc;
            padding: 30px;
            border-radius: 15px;
        }

        .data-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .refresh-btn {
            background: #4CAF50;
        }

        .items-list {
            display: grid;
            gap: 15px;
        }

        .item-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: transform 0.2s;
        }

        .item-card:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .item-info {
            flex: 1;
        }

        .item-name {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 5px;
        }

        .item-email {
            color: #666;
            font-size: 14px;
        }

        .item-meta {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }

        .delete-btn {
            background: #ff4757;
            padding: 8px 20px;
            font-size: 14px;
            margin-left: 15px;
        }

        .delete-btn:hover {
            background: #ff3838;
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: #667eea;
        }

        .error {
            background: #ff4757;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            animation: slideIn 0.3s ease;
        }

        .success {
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            animation: slideIn 0.3s ease;
        }

        .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
        }

        @keyframes slideIn {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @media (max-width: 768px) {
            .content {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 1.5em;
            }

            .item-card {
                flex-direction: column;
                text-align: center;
            }

            .delete-btn {
                margin-left: 0;
                margin-top: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Durable Object Database Demo</h1>
            <p>Store and retrieve data using Cloudflare Durable Objects</p>
        </div>
        
        <div class="content">
            <div id="message"></div>
            
            <div class="form-section">
                <h2>➕ Add New Entry</h2>
                <form id="dataForm">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required placeholder="Enter full name">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required placeholder="Enter email address">
                    </div>
                    <button type="submit">Add Entry</button>
                </form>
            </div>
            
            <div class="data-section">
                <div class="data-header">
                    <h2>📋 Saved Entries</h2>
                    <button class="refresh-btn" onclick="loadEntries()">🔄 Refresh</button>
                </div>
                <div id="entriesList">
                    <div class="loading">Loading entries...</div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const API_BASE = '/api';
        
        // Load entries on page load
        document.addEventListener('DOMContentLoaded', () => {
            loadEntries();
        });
        
        // Handle form submission
        document.getElementById('dataForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            try {
                const response = await fetch(\`\${API_BASE}/add\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email })
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showMessage('Entry added successfully!', 'success');
                    document.getElementById('dataForm').reset();
                    loadEntries(); // Reload the list
                } else {
                    showMessage(result.error || 'Failed to add entry', 'error');
                }
            } catch (error) {
                showMessage('Network error: ' + error.message, 'error');
            }
        });
        
        // Load all entries
        async function loadEntries() {
            try {
                const response = await fetch(\`\${API_BASE}/list\`);
                
                if (!response.ok) {
                    throw new Error('Failed to load entries');
                }
                
                const entries = await response.json();
                displayEntries(entries);
            } catch (error) {
                showMessage('Error loading entries: ' + error.message, 'error');
                document.getElementById('entriesList').innerHTML = '<div class="error">Failed to load entries. Please refresh the page.</div>';
            }
        }
        
        // Display entries
        function displayEntries(entries) {
            const entriesList = document.getElementById('entriesList');
            
            if (!entries || entries.length === 0) {
                entriesList.innerHTML = '<div class="empty-state">📭 No entries found. Add your first entry above!</div>';
                return;
            }
            
            entriesList.innerHTML = \`
                <div class="items-list">
                    \${entries.map(entry => \`
                        <div class="item-card">
                            <div class="item-info">
                                <div class="item-name">\${escapeHtml(entry.name)}</div>
                                <div class="item-email">📧 \${escapeHtml(entry.email)}</div>
                                <div class="item-meta">🆔 ID: \${entry.id.substring(0, 15)}... | 📅 Added: \${formatDate(entry.timestamp)}</div>
                            </div>
                            <button class="delete-btn" onclick="deleteEntry('\${entry.id}')">Delete</button>
                        </div>
                    \`).join('')}
                </div>
            \`;
        }
        
        // Delete entry
        async function deleteEntry(id) {
            if (!confirm('Are you sure you want to delete this entry?')) return;
            
            try {
                const response = await fetch(\`\${API_BASE}/delete/\${id}\`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showMessage('Entry deleted successfully!', 'success');
                    loadEntries(); // Reload the list
                } else {
                    showMessage(result.error || 'Failed to delete entry', 'error');
                }
            } catch (error) {
                showMessage('Network error: ' + error.message, 'error');
            }
        }
        
        // Show message
        function showMessage(msg, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.innerHTML = \`<div class="\${type}">\${msg}</div>\`;
            setTimeout(() => {
                messageDiv.innerHTML = '';
            }, 3000);
        }
        
        // Format date
        function formatDate(timestamp) {
            if (!timestamp) return 'Just now';
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return \`\${diffMins} minute\${diffMins > 1 ? 's' : ''} ago\`;
            if (diffHours < 24) return \`\${diffHours} hour\${diffHours > 1 ? 's' : ''} ago\`;
            if (diffDays < 7) return \`\${diffDays} day\${diffDays > 1 ? 's' : ''} ago\`;
            return date.toLocaleDateString();
        }
        
        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            loadEntries();
        }, 30000);
    </script>
</body>
</html>`;
}
