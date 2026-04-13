Write-Host "TEST 1: Normal ping" -ForegroundColor Green
$body = @{target = "8.8.8.8"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:8000/api/it/network/ping -Method POST -Body $body -ContentType application/json | Select-Object -ExpandProperty Content

Write-Host "`nTEST 2: Semicolon injection" -ForegroundColor Green
$body = @{target = "8.8.8.8; id"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:8000/api/it/network/ping -Method POST -Body $body -ContentType application/json | Select-Object -ExpandProperty Content

Write-Host "`nTEST 3: Pipe injection" -ForegroundColor Green
$body = @{target = "8.8.8.8 | id"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:8000/api/it/network/ping -Method POST -Body $body -ContentType application/json | Select-Object -ExpandProperty Content

Write-Host "`nTEST 4: Valid hostname" -ForegroundColor Yellow
$body = @{target = "google.com"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:8000/api/it/network/ping -Method POST -Body $body -ContentType application/json | Select-Object -ExpandProperty Content
