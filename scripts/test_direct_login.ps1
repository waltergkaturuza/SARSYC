# PowerShell Script: Test Direct Login Endpoint
# Run this in PowerShell to test the direct-login API

Write-Host "Testing Direct Login Endpoint..." -ForegroundColor Cyan
Write-Host ""

$uri = "https://www.sarsyc.org/api/auth/direct-login"
$body = @{
    email = "admin@sarsyc.org"
    password = "Admin@1234"
} | ConvertTo-Json

Write-Host "Sending request to: $uri" -ForegroundColor Yellow
Write-Host "Email: admin@sarsyc.org" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $uri `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "Response received:" -ForegroundColor Green
    Write-Host ""
    $response | ConvertTo-Json -Depth 10
    
    if ($response.success) {
        Write-Host ""
        Write-Host "✅ LOGIN SUCCESSFUL!" -ForegroundColor Green
        Write-Host "User: $($response.user.email)" -ForegroundColor Green
        Write-Host "Role: $($response.user.role)" -ForegroundColor Green
        Write-Host "Token length: $($response.token.Length) characters" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now access the admin panel at: https://www.sarsyc.org/admin" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ LOGIN FAILED" -ForegroundColor Red
        Write-Host "Error: $($response.error)" -ForegroundColor Red
        if ($response.details) {
            Write-Host "Details: $($response.details)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host ""
    Write-Host "❌ REQUEST FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
