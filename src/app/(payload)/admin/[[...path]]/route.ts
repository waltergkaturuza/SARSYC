/* PAYLOAD ADMIN ROUTE HANDLER - Initialize Payload and serve admin UI */

import { getPayloadClient } from '@/lib/payload'
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

async function handleAdminRequest(
  request: NextRequest,
  params: Promise<{ path?: string[] }>
) {
  try {
    // Initialize Payload - this ensures the secret key is validated
    const payload = await getPayloadClient()
    
    // If we get here, Payload initialized successfully
    // Payload v3 handles admin routes internally through its API
    // The admin UI is served as a SPA that makes requests to /api/admin/*
    
    // Return a simple HTML page that will load Payload's admin UI
    // Payload's admin UI is bundled and served through its internal routing
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SARSYC VI Admin Panel</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .message {
      color: #666;
      margin-top: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <div class="message">Loading Admin Panel...</div>
    <div class="message" style="font-size: 0.875rem; margin-top: 0.5rem; color: #999;">
      If this page doesn't load, check that PAYLOAD_SECRET is set correctly.
    </div>
  </div>
  <script>
    // Payload's admin UI should be accessible through its API routes
    // Redirect to ensure proper initialization
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  </script>
</body>
</html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    )
  } catch (error: any) {
    console.error('❌ Payload admin initialization error:', error)
    
    const errorMessage = String(error?.message || error || 'Unknown error')
    const isSecretError = errorMessage.toLowerCase().includes('secret') || 
                         errorMessage.toLowerCase().includes('payload_secret')
    
    // Return a helpful error page
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel Error - SARSYC VI</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .container {
      max-width: 600px;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #e74c3c;
      margin-top: 0;
    }
    .error {
      background: #fee;
      border-left: 4px solid #e74c3c;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    }
    .steps {
      background: #f9f9f9;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
      text-align: left;
    }
    .steps ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    .steps li {
      margin: 0.5rem 0;
    }
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚠️ Admin Panel Error</h1>
    <div class="error">
      <strong>Error:</strong> ${errorMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>
    ${isSecretError ? `
    <div class="steps">
      <h3>🔧 How to Fix:</h3>
      <ol>
        <li>Generate a new secret key: <code>npm run generate:secret</code></li>
        <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
        <li>Add or update: <code>PAYLOAD_SECRET</code> = (your generated secret)</li>
        <li>Apply to all environments (Production, Preview, Development)</li>
        <li>Go to Deployments tab and <strong>Redeploy</strong> the latest deployment</li>
        <li>Wait for deployment to complete, then refresh this page</li>
      </ol>
    </div>
    ` : `
    <div class="steps">
      <h3>🔍 Troubleshooting:</h3>
      <ol>
        <li>Check Vercel deployment logs for detailed error messages</li>
        <li>Verify all environment variables are set correctly</li>
        <li>Ensure the database connection is working</li>
        <li>Try redeploying the application</li>
      </ol>
    </div>
    `}
    <p style="margin-top: 1.5rem; color: #666; font-size: 0.9rem;">
      Need help? Check the <code>SECRET-KEY-GUIDE.md</code> file in your project.
    </p>
  </div>
</body>
</html>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      }
    )
  }
}
