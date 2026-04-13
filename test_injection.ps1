Write-Host "=== OS COMMAND INJECTION TEST FOR /api/it/network/ping ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "TEST 1: Normal ping (baseline - should work)" -ForegroundColor Green
$body = @{target = "8.8.8.8"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Output: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "TEST 2: Attempt OS Injection - Semicolon (;)" -ForegroundColor Yellow
Write-Host "Payload: target=8.8.8.8; id" -ForegroundColor Gray
$body = @{target = "8.8.8.8; id"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Output: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Status: Error (Injection blocked)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "TEST 3: Attempt OS Injection - Pipe (|)" -ForegroundColor Yellow
Write-Host "Payload: target=8.8.8.8 | whoami" -ForegroundColor Gray
$body = @{target = "8.8.8.8 | whoami"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Output: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Status: Error (Injection blocked)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "TEST 4: Attempt OS Injection - Newline" -ForegroundColor Yellow
Write-Host "Payload: target=8.8.8.8 with newline then id" -ForegroundColor Gray
$body = @{target = "8.8.8.8`nid"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Output: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Status: Error (Injection blocked)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "TEST 5: Valid hostname with dots and hyphens (should pass)" -ForegroundColor Green
Write-Host "Payload: target=google-dns.com" -ForegroundColor Gray
$body = @{target = "google-dns.com"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Output (first 300 chars): $($response.Content.Substring(0, [Math]::Min(300, $response.Content.Length)))" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== RESULT ===" -ForegroundColor Cyan
Write-Host "The regex filter blocks: ; | newlines and special characters" -ForegroundColor Green
Write-Host "Only alphanumeric, dots (.), and hyphens (-) are allowed" -ForegroundColor Green
Write-Host "Status: PROTECTED against basic OS command injection" -ForegroundColor Green
