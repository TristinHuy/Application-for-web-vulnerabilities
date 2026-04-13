# OS Command Injection - Remediation & Fix Guide

## Quick Fix (Immediate)

### Option 1: Restore Original Protected Code

Replace the vulnerable `network_ping` function in `/backend/app/routers/it_tools.py`:

```python
@router.post("/network/ping")
def network_ping(payload: PingRequest):
    """
    FIXED: Use proper argument escaping to prevent command injection.
    """
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
        return {
            "command": " ".join(command),
            "return_code": 0,
            "output": output,
        }
    except subprocess.CalledProcessError as exc:
        return {
            "command": " ".join(command),
            "return_code": exc.returncode,
            "output": exc.output,
        }
    except subprocess.SubprocessError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
```

### Option 2: Disable the Endpoint

Remove or comment out the route:

```python
# @router.post("/network/ping")
# def network_ping(payload: PingRequest):
#     ...
```

### Step 1: Restore the Backup
```bash
cd D:\Military\CSATTT_PROJECT-feat-m2-hr-documents\backend\app\routers
cp it_tools_backup.py it_tools.py
```

### Step 2: Rebuild Container
```bash
docker-compose -f docker-compose.yml up -d --build --force-recreate backend
```

### Step 3: Verify Fix
```bash
# This should return "Invalid target format" (400 Bad Request)
curl -X POST http://localhost/api/it/network/ping \
  -H "Content-Type: application/json" \
  -d '{"target": "8.8.8.8 && whoami"}'
```

Expected Response:
```json
{"detail":"Invalid target format"}
```

---

## Complete Remediation Checklist

### Phase 1: Immediate Containment (0-1 hour)

- [ ] Restore original protected code or disable endpoint
- [ ] Rebuild and restart backend container
- [ ] Verify the vulnerability is fixed
- [ ] Check application logs for suspicious activity
- [ ] Document time of detection and remediation

### Phase 2: Security Audit (1-4 hours)

- [ ] Review all API endpoints for similar vulnerabilities
- [ ] Check for:
  - subprocess usage with shell=True
  - String interpolation in OS commands
  - Eval/exec usage with user input
  - SQL injection vulnerabilities
  - Command injection in other services

- [ ] Audit file: `/backend/app/routers/`
  - [ ] it_tools.py (FIXED)
  - [ ] hr.py (Check path traversal in download_document)
  - [ ] auth.py (Check for auth bypass)
  - [ ] products.py (Check for injection)

### Phase 3: Logging & Monitoring (4-8 hours)

- [ ] Enable comprehensive audit logging
- [ ] Set up alerts for:
  - Shell command characters in API requests
  - Unusual process execution
  - File access patterns
  - Network connection attempts

- [ ] Review logs for exploitation:
  - Look for: whoami, id, cat, ls, curl, wget, nc, bash, sh
  - Check timestamps around deployment
  - Identify source IPs of requests

### Phase 4: System Hardening (8-24 hours)

- [ ] Run container as non-root user
- [ ] Implement read-only root filesystem
- [ ] Drop unnecessary Linux capabilities
- [ ] Use security scanning tools
- [ ] Implement WAF rules

### Phase 5: Testing & Validation (24-48 hours)

- [ ] Automated security testing in CI/CD
- [ ] Manual penetration testing
- [ ] Code review for similar issues
- [ ] Load testing to ensure no performance impact
- [ ] Regression testing of all features

---

## Code Review Template

Use this to review for similar vulnerabilities in other files:

```python
# VULNERABLE - DO NOT USE
subprocess.check_output(f"command {user_input}", shell=True)
os.system(f"command {user_input}")
os.popen(f"command {user_input}")

# SAFE - USE THIS
subprocess.check_output(["command", user_input], shell=False)
subprocess.run(["command", user_input], shell=False)
```

---

## Hardened Dockerfile

Add these security measures to backend Dockerfile:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/documents /app/secrets /app/static/uploads && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Run with read-only root filesystem
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Updated docker-compose.yml

```yaml
services:
  backend:
    build: ./backend
    container_name: corpvuln_backend
    depends_on:
      - db
    networks:
      - corpnet
    environment:
      DATABASE_URL: postgresql://postgres:postgres123@db:5432/corpvuln
    # Security configurations
    read_only: true  # Read-only root filesystem
    cap_drop:
      - ALL  # Drop all capabilities
    cap_add:
      - NET_BIND_SERVICE  # Only needed capability
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp
      - /app/static/uploads
    volumes:
      - /app/static/uploads  # Temporary writable mount
```

---

## WAF Rules (nginx)

Add these rules to nginx config to block injection attempts:

```nginx
# Block shell operators in query parameters and body
if ($args ~ "[\&\|\;\`\$\(\)]") {
    return 403;
}

# Block shell operators in POST body
location /api/ {
    # Block requests with shell operators
    if ($request_body ~ "[\&\|\;\`\$\(\)]") {
        return 403;
    }
    
    proxy_pass http://backend:8000;
}
```

---

## Monitoring & Alerting

### CloudWatch Alarm (AWS)

```json
{
  "AlarmName": "CommandInjectionAttempt",
  "MetricName": "Http403Count",
  "Statistic": "Sum",
  "Period": 300,
  "EvaluationPeriods": 1,
  "Threshold": 5,
  "ComparisonOperator": "GreaterThanThreshold",
  "AlarmActions": ["arn:aws:sns:..."]
}
```

### Log Parser

```python
import re

suspicious_patterns = [
    r'\s(whoami|id|ls|cat|curl|wget|nc|bash|sh)\s',
    r'[\&\|\;\`\$\(\)]',
    r'\.\./',
    r'/etc/passwd',
    r'/app/secrets'
]

def check_suspicious(request_body):
    for pattern in suspicious_patterns:
        if re.search(pattern, request_body):
            return True
    return False
```

---

## Testing After Fix

### Regression Tests

Run these to verify the fix works:

```python
import requests

# Test 1: Valid ping should work
payload = {"target": "8.8.8.8"}
response = requests.post("http://localhost/api/it/network/ping", json=payload)
assert response.status_code == 200

# Test 2: Command injection should be blocked
payload = {"target": "8.8.8.8 && whoami"}
response = requests.post("http://localhost/api/it/network/ping", json=payload)
assert response.status_code == 400
assert "Invalid target format" in response.text

# Test 3: Special characters should be blocked
for char in ['|', ';', '`', '$(', '&']:
    payload = {"target": f"8.8.8.8{char}whoami"}
    response = requests.post("http://localhost/api/it/network/ping", json=payload)
    assert response.status_code == 400

print("✓ All security tests passed!")
```

---

## Incident Response

### If Exploitation Occurred:

1. **Immediate Actions** (0-15 minutes)
   - [ ] Isolate affected system from network
   - [ ] Preserve logs and evidence
   - [ ] Notify security team
   - [ ] Begin forensics investigation

2. **Initial Analysis** (15 minutes - 1 hour)
   - [ ] Check application logs for suspicious commands
   - [ ] Review Docker container logs
   - [ ] Check filesystem for unauthorized files
   - [ ] Review network connections

3. **Deeper Investigation** (1-4 hours)
   - [ ] Check for persistence mechanisms (cron, systemd)
   - [ ] Review user account creation/modification
   - [ ] Check web root for backdoors
   - [ ] Review database access logs

4. **Remediation** (4-24 hours)
   - [ ] Apply fixes to all vulnerable endpoints
   - [ ] Rotate credentials (database, API keys, secrets)
   - [ ] Rebuild container from clean image
   - [ ] Restore from trusted backup if necessary
   - [ ] Full security audit of codebase

5. **Post-Incident** (24-72 hours)
   - [ ] Complete vulnerability assessment
   - [ ] Implement WAF rules
   - [ ] Add monitoring/alerting
   - [ ] Conduct security training
   - [ ] Document lessons learned

---

## Files Included in Remediation

1. **it_tools_backup.py** - Original protected version (use this to fix)
2. **VULNERABILITY_DOCUMENTATION.md** - Full vulnerability details
3. **TEST_RESULTS_PROOF_OF_CONCEPT.md** - Proof of exploitation
4. **REMEDIATION_GUIDE.md** - This file

---

## Key Lessons

### What Went Wrong
1. Removed input validation to "support" command chaining
2. Used shell=True in subprocess call
3. Used string interpolation instead of argument lists
4. Ran container as root user
5. No monitoring or WAF in place

### What to Do Right
1. ✅ Always validate and sanitize user input
2. ✅ Never use shell=True unless absolutely necessary
3. ✅ Always use list form for subprocess commands
4. ✅ Run containers as non-root users
5. ✅ Implement WAF and security monitoring
6. ✅ Regular security audits and code reviews
7. ✅ Automated security testing in CI/CD

---

## References

- **OWASP**: Command Injection - https://owasp.org/www-community/attacks/Command_Injection
- **CWE-78**: OS Command Injection - https://cwe.mitre.org/data/definitions/78.html
- **Python Security**: Subprocess Safety - https://docs.python.org/3/library/subprocess.html#security-considerations

---

## Support & Questions

For questions about this remediation:
1. Review the VULNERABILITY_DOCUMENTATION.md
2. Check Python subprocess documentation
3. Consult OWASP Command Injection guidelines
4. Contact your security team

