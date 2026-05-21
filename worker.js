// worker.js - Complete working version
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Route API requests to Durable Object
    if (url.pathname === "/add" || url.pathname === "/list" || url.pathname.startsWith("/delete/")) {
      const id = env.MyDatabase.idFromName("main");
      const obj = env.MyDatabase.get(id);
      return obj.fetch(request);
    }

    // Serve HTML page
    if (url.pathname === "/") {
      const html = getHTML();
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }

    return new Response("Not Found", { status: 404 });
  }
};

// Durable Object Class
export class MyDatabase {
  constructor(state, env) {
    this.storage = state.storage;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };

    // GET /list - Get all records
    if (url.pathname === "/list" && method === "GET") {
      const entries = await this.storage.list();
      const data = [];
      for (const [key, value] of entries) {
        data.push({ 
          id: key, 
          name: value.name, 
          email: value.email,
          timestamp: value.timestamp 
        });
      }
      // Sort by timestamp (newest first)
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // POST /add - Add new record
    if (url.pathname === "/add" && method === "POST") {
      const { name, email } = await request.json();
      
      if (!name || !email) {
        return new Response(JSON.stringify({ error: "Name and email required" }), {
          status: 400,
          headers: corsHeaders
        });
      }
      
      const id = Date.now().toString();
      await this.storage.put(id, { 
        name, 
        email, 
        timestamp: new Date().toISOString() 
      });
      
      return new Response(JSON.stringify({ success: true, id }), {
        status: 201,
        headers: corsHeaders
      });
    }

    // DELETE /delete/:id - Delete record
    if (url.pathname.startsWith("/delete/") && method === "DELETE") {
      const id = url.pathname.split("/").pop();
      await this.storage.delete(id);
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: corsHeaders
    });
  }
}

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Durable Objects Database</title>
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
      max-width: 800px;
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
    
    .content {
      padding: 40px;
    }
    
    .form-section {
      background: #f7f9fc;
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 30px;
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
      width: 100%;
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
      width: auto;
      padding: 8px 20px;
    }
    
    .records-list {
      display: grid;
      gap: 15px;
    }
    
    .record-card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: transform 0.2s;
    }
    
    .record-card:hover {
      transform: translateX(5px);
    }
    
    .record-info {
      flex: 1;
    }
    
    .record-name {
      font-size: 18px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 5px;
    }
    
    .record-email {
      color: #666;
      font-size: 14px;
    }
    
    .record-meta {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
    
    .delete-btn {
      background: #ff4757;
      padding: 8px 20px;
      font-size: 14px;
      width: auto;
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
    }
    
    .success {
      background: #4CAF50;
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    
    @media (max-width: 768px) {
      .content {
        padding: 20px;
      }
      
      .record-card {
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
      <h1>🗄️ Durable Objects Database</h1>
      <p>Cloudflare Durable Objects Demo</p>
    </div>
    
    <div class="content">
      <div id="message"></div>
      
      <div class="form-section">
        <h2>➕ Add New Record</h2>
        <form id="recordForm">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required placeholder="Enter full name">
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Enter email address">
          </div>
          <button type="submit">Add Record</button>
        </form>
      </div>
      
      <div class="data-section">
        <div class="data-header">
          <h2>📋 Stored Records</h2>
          <button class="refresh-btn" onclick="loadRecords()">🔄 Refresh</button>
        </div>
        <div id="recordsList">
          <div class="loading">Loading records...</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Load records on page load
    document.addEventListener('DOMContentLoaded', () => {
      loadRecords();
    });
    
    // Handle form submission
    document.getElementById('recordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      
      try {
        const response = await fetch('/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          showMessage('Record added successfully!', 'success');
          document.getElementById('recordForm').reset();
          loadRecords();
        } else {
          showMessage(result.error || 'Failed to add record', 'error');
        }
      } catch (error) {
        showMessage('Network error: ' + error.message, 'error');
      }
    });
    
    // Load all records
    async function loadRecords() {
      try {
        const response = await fetch('/list');
        
        if (!response.ok) {
          throw new Error('Failed to load records');
        }
        
        const records = await response.json();
        displayRecords(records);
      } catch (error) {
        showMessage('Error loading records: ' + error.message, 'error');
        document.getElementById('recordsList').innerHTML = '<div class="error">Failed to load records. Please refresh the page.</div>';
      }
    }
    
    // Display records
    function displayRecords(records) {
      const recordsList = document.getElementById('recordsList');
      
      if (!records || records.length === 0) {
        recordsList.innerHTML = '<div class="empty-state">📭 No records found. Add your first record above!</div>';
        return;
      }
      
      recordsList.innerHTML = \`
        <div class="records-list">
          \${records.map(record => \`
            <div class="record-card">
              <div class="record-info">
                <div class="record-name">👤 \${escapeHtml(record.name)}</div>
                <div class="record-email">📧 \${escapeHtml(record.email)}</div>
                <div class="record-meta">🆔 ID: \${record.id}</div>
              </div>
              <button class="delete-btn" onclick="deleteRecord('\${record.id}')">Delete</button>
            </div>
          \`).join('')}
        </div>
      \`;
    }
    
    // Delete record
    async function deleteRecord(id) {
      if (!confirm('Are you sure you want to delete this record?')) return;
      
      try {
        const response = await fetch(\`/delete/\${id}\`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          showMessage('Record deleted successfully!', 'success');
          loadRecords();
        } else {
          showMessage(result.error || 'Failed to delete record', 'error');
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
    
    // Escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}
