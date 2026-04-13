# Test 1: Normal ping
Write-Host "TEST 1: Normal ping request" -ForegroundColor Green
$body = @{"target" = "8.8.8.8"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/it/network/ping" -Method POST -Body $body -ContentType "application/json"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
Write-Host ""

# Test 2: Semicolon command injection
Write-Host "TEST 2: Command injection (semicolon)" -ForegroundColor Green
$body = @{"target" = "8.8.8.8; id"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/it/network/ping" -Method POST -Body $body -ContentType "application/json"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
Write-Host ""

# Test 3: Pipe command injection
Write-Host "TEST 3: Command injection (pipe)" -ForegroundColor Green
$body = @{"target" = "8.8.8.8 | id"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/it/network/ping" -Method POST -Body $body -ContentType "application/json"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
Write-Host ""

# Test 4: Backtick command injection
Write-Host "TEST 4: Command injection (backticks)" -ForegroundColor Green
$body = @{"target" = "8.8.8.8`whoami`"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/it/network/ping" -Method POST -Body $body -ContentType "application/json"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
Write-Host ""

# Test 5: Command substitution $()
Write-Host "TEST 5: Command injection (substitution)" -ForegroundColor Green
$body = @{"target" = "8.8.8.8`$(whoami)"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/it/network/ping" -Method POST -Body $body -ContentType "application/json"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
Write-Host ""

# Test 6: Valid input
Write-Host "TEST 6: Valid input (should work)" -ForegroundColor Yellow
$body = @{"target" = "google-dns-1.com"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/it/network/ping" -Method POST -Body $body -ContentType "application/json"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Response (first 500 chars): $($response.Content.Substring(0, [Math]::Min(500, $response.Content.Length)))"
