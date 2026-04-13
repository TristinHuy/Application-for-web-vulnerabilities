import requests
import json

# Test 1: Normal ping (should work)
print("=" * 60)
print("TEST 1: Normal ping request")
print("=" * 60)
payload = {"target": "8.8.8.8"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
print()

# Test 2: Attempt command injection with semicolon
print("=" * 60)
print("TEST 2: Command injection attempt (semicolon)")
print("=" * 60)
payload = {"target": "8.8.8.8; id"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
print()

# Test 3: Attempt command injection with pipe
print("=" * 60)
print("TEST 3: Command injection attempt (pipe)")
print("=" * 60)
payload = {"target": "8.8.8.8 | id"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
print()

# Test 4: Attempt command injection with backticks
print("=" * 60)
print("TEST 4: Command injection attempt (backticks)")
print("=" * 60)
payload = {"target": "8.8.8.8`whoami`"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
print()

# Test 5: Attempt command injection with $()
print("=" * 60)
print("TEST 5: Command injection attempt (command substitution)")
print("=" * 60)
payload = {"target": "8.8.8.8$(whoami)"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
print()

# Test 6: Attempt with newline injection
print("=" * 60)
print("TEST 6: Command injection attempt (newline)")
print("=" * 60)
payload = {"target": "8.8.8.8\nid"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
print()

# Test 7: Valid hostname with dots and hyphens
print("=" * 60)
print("TEST 7: Valid hostname (should work)")
print("=" * 60)
payload = {"target": "google-dns-1.com"}
response = requests.post("http://localhost:8000/api/it/network/ping", json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)[:500]}...")
