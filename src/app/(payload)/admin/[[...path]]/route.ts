/* PAYLOAD ADMIN REDIRECT - Show admin options instead of loading spinner */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Handle all HTTP methods
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request, params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request, params)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request, params)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request, params)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return handleAdminRequest(request, params)
}

async function handleAdminRequest(
  request: NextRequest,
  params: Promise<{ path?: string[] }>
) {
  // Get the path segments
  const resolvedParams = await params
  const pathSegments = resolvedParams?.path || []
  const path = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : ''
  
  // Get request origin to avoid port mismatches
  const url = new URL(request.url)
  const origin = url.origin
  
  // Redirect to the new custom admin dashboard
  return NextResponse.redirect(new URL('/admin/dashboard', origin))
}

    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SARSYC VI Admin</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }
    h1 {
      color: #2c3e50;
      margin-bottom: 2rem;
      text-align: center;
    }
    .option-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: all 0.3s;
    }
    .option-card:hover {
      border-color: #3498db;
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
      transform: translateY(-2px);
    }
    .option-card h3 {
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
    }
    .option-card p {
      color: #7f8c8d;
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
    }
    .btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #3498db;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      transition: background 0.3s;
    }
    .btn:hover {
      background: #2980b9;
    }
    .btn-secondary {
      background: #95a5a6;
    }
    .btn-secondary:hover {
      background: #7f8c8d;
    }
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #e74c3c;
    }
    .code-block {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    .note {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 1rem;
      margin: 2rem 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎛️ SARSYC VI Admin Options</h1>
    
    <div class="option-card">
      <h3>📋 Registrations Management</h3>
      <p>View and manage conference registrations, export to CSV, and check-in participants</p>
      <a href="/admin/registrations" class="btn">Go to Registrations →</a>
    </div>
    
    <div class="option-card">
      <h3>🚀 Use Custom Server (Full Payload Admin)</h3>
      <p>Run the custom server to access Payload's complete admin UI with all features</p>
      <div class="code-block">
cd C:\\Users\\Administrator\\Documents\\SARSYC\\sarsyc-platform<br>
npm run dev:server<br>
# Then access: http://localhost:3001/admin
      </div>
      <p style="font-size: 0.85rem; color: #7f8c8d; margin-top: 0.5rem;">
        This runs Express + Next.js + Payload together
      </p>
    </div>
    
    <div class="option-card">
      <h3>🗄️ Direct Database Access</h3>
      <p>Use a database GUI tool to manage data directly</p>
      <p>Recommended tools:</p>
      <ul style="margin: 0.5rem 0 1rem 1.5rem; color: #7f8c8d;">
        <li><strong>pgAdmin</strong> - Full-featured PostgreSQL tool</li>
        <li><strong>DBeaver</strong> - Universal database manager</li>
        <li><strong>TablePlus</strong> - Modern, native GUI</li>
      </ul>
      <a href="https://www.pgadmin.org/download/" target="_blank" class="btn btn-secondary">Download pgAdmin →</a>
    </div>
    
    <div class="option-card">
      <h3>🔌 API Routes</h3>
      <p>Your API endpoints are working. Use them to manage data programmatically</p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
        <a href="/api/config" target="_blank" class="btn btn-secondary">View Config</a>
        <a href="/api/registrations" target="_blank" class="btn btn-secondary">Registrations API</a>
        <a href="/api/speakers" target="_blank" class="btn btn-secondary">Speakers API</a>
      </div>
    </div>
    
    <div class="note">
      <strong>📝 Note:</strong> Payload's full admin UI requires custom server setup. 
      The custom server is already configured and ready to use with <code>npm run dev:server</code>.
      See <code>USE-CUSTOM-SERVER.md</code> for details.
    </div>
    
    <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e0e0e0;">
      <a href="/" class="btn btn-secondary">← Back to Homepage</a>
    </div>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  )
}
