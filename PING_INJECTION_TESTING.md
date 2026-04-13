# OS Command Injection Testing - /api/it/network/ping Endpoint

## Overview
The `/api/it/network/ping` endpoint in the IT Tools router is intentionally designed for testing web security vulnerabilities. This document explains how to test for OS command injection vulnerabilities on this endpoint.

## Endpoint Details
- **URL**: `POST /api/it/network/ping`
- **Location**: Backend Flask/FastAPI service at `http://backend:8000`
- **Accessible via**: `http://localhost/api/it/network/ping` (through nginx proxy)

## How the Endpoint Works
```python
@router.post("/network/ping")
def network_ping(payload: PingRequest):
    # Validate target - only allow alphanumeric, dots, and hyphens
    if not re.match(r'^[a-zA-Z0-9.\-]+$', payload.target):
        raise HTTPException(status_code=400, detail="Invalid target format")
    
    # Use list form of subprocess to avoid shell=True vulnerability
    command = ["ping", "-c", "4", payload.target]
    try:
        output = subprocess.check_output(
            command,
            stderr=subprocess.STDOUT,
            text=True,
            timeout=15,
        )
```

The endpoint:
1. Accepts a JSON payload with a "target" field (hostname/IP)
2. Validates input using regex: `^[a-zA-Z0-9.\-]+$`
3. Constructs a ping command with proper argument separation (list form)
4. Executes the command safely without shell=True

## Testing Methods

### Method 1: Using PowerShell
```powershell
# Test 1: Valid input (baseline)
$body = @{target = "8.8.8.8"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json

# Test 2: Semicolon injection attempt
$body = @{target = "8.8.8.8; id"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json

# Test 3: Pipe injection attempt
$body = @{target = "8.8.8.8 | whoami"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost/api/it/network/ping -Method POST -Body $body -ContentType application/json
```

### Method 2: Using curl
```bash
# Valid request
curl -X POST http://localhost/api/it/network/ping \
  -H "Content-Type: application/json" \
  -d '{"target": "8.8.8.8"}'

# Injection attempt
curl -X POST http://localhost/api/it/network/ping \
  -H "Content-Type: application/json" \
  -d '{"target": "8.8.8.8; id"}'

# Injection attempt with pipe
curl -X POST http://localhost/api/it/network/ping \
  -H "Content-Type: application/json" \
  -d '{"target": "8.8.8.8 | whoami"}'
```

### Method 3: Using Python
```python
import requests
import json

# Valid request
payload = {"target": "8.8.8.8"}
response = requests.post("http://localhost/api/it/network/ping", json=payload)
print(response.json())

# Injection attempt
payload = {"target": "8.8.8.8; id"}
response = requests.post("http://localhost/api/it/network/ping", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
```

## Injection Techniques to Try

### 1. Semicolon Separator
```json
{"target": "8.8.8.8; id"}
{"target": "8.8.8.8; cat /etc/passwd"}
{"target": "8.8.8.8; whoami"}
```
**Result**: Blocked by regex (semicolon not allowed)

### 2. Pipe (|)
```json
{"target": "8.8.8.8 | id"}
{"target": "8.8.8.8 | whoami"}
```
**Result**: Blocked by regex (pipe not allowed)

### 3. Command Substitution with Backticks
```json
{"target": "8.8.8.8`id`"}
{"target": "8.8.8.8`whoami`"}
```
**Result**: Blocked by regex (backticks not allowed)

### 4. Command Substitution with $()
```json
{"target": "8.8.8.8$(id)"}
{"target": "8.8.8.8$(whoami)"}
```
**Result**: Blocked by regex (parentheses not allowed)

### 5. Newline Injection
```json
{"target": "8.8.8.8\nid"}
```
**Result**: Blocked by regex (newline not allowed)

### 6. Logical Operators
```json
{"target": "8.8.8.8 && id"}
{"target": "8.8.8.8 || id"}
```
**Result**: Blocked by regex (ampersand not allowed)

## Expected Results

### Successfully Blocked Payloads (400 Bad Request)
When any special character (`;`, `|`, `` ` ``, `$`, `(`, `)`, `&`, `!`, etc.) is included, the endpoint returns:
```json
{
  "detail": "Invalid target format"
}
```
Status Code: **400**

### Valid Payloads (200 OK)
When input contains only alphanumeric characters, dots, and hyphens:
```json
{
  "command": "ping -c 4 8.8.8.8",
  "return_code": 0,
  "output": "PING 8.8.8.8 (8.8.8.8): 56 data bytes\n64 bytes from 8.8.8.8: icmp_seq=0 ttl=119 time=10.123 ms\n..."
}
```
Status Code: **200**

## Why This Endpoint is Protected

1. **Input Validation**: Uses strict regex pattern `^[a-zA-Z0-9.\-]+$`
2. **No Shell Execution**: Command is passed as a list to subprocess, not as a string
3. **No string interpolation**: The target is used directly without shell evaluation
4. **Proper argument separation**: The ping command and target are separate list elements

## Vulnerable Endpoints (For Comparison)

If you want to test actual OS command injection vulnerabilities, try:
- **`/api/it/chat/send`** - Path traversal vulnerability (read arbitrary files)
- **`/api/it/chat/upload`** - File upload RCE vulnerability (upload PHP files)

## Real Vulnerable Code Example
```python
# VULNERABLE - DO NOT USE
def vulnerable_ping(target):
    output = subprocess.check_output(f"ping -c 4 {target}", shell=True)
    return output

# Input: "8.8.8.8; rm -rf /"  would execute deletion command
```

## Summary
The `/api/it/network/ping` endpoint demonstrates **proper protection** against OS command injection attacks through:
- Input validation with regex
- Safe subprocess execution (list form, no shell=True)
- Proper error handling

Test results show all injection attempts are correctly blocked with HTTP 400 responses.
