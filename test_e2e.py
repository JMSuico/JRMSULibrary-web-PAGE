import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:8000/api"

print("--- DEEP SYSTEM VALIDATION ---")

# 1. Test Content Read (GET)
try:
    print("\n[1] Testing GET /content/ (Database Read)...")
    req = urllib.request.Request(f"{BASE_URL}/content/")
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode())
        print(f"SUCCESS: Fetched {len(data)} content pages.")
        if len(data) > 0:
            print(f"Sample Title: {data[0].get('title')}")
except Exception as e:
    print(f"FAILED: {e}")

# 2. Test CSRF Token Fetch
csrf_token = None
cookie = None
try:
    print("\n[2] Testing GET /csrf/ (Security Middleware)...")
    req = urllib.request.Request(f"{BASE_URL}/csrf/")
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode())
        print(f"SUCCESS: {data.get('message')}")
        cookie = response.headers.get('Set-Cookie')
        if cookie and 'csrftoken' in cookie:
            csrf_token = cookie.split('csrftoken=')[1].split(';')[0]
            print(f"CSRF Token received: {csrf_token[:10]}...")
except Exception as e:
    print(f"FAILED: {e}")

# 3. Test Contact Write (POST)
try:
    print("\n[3] Testing POST /contact/ (Database Write)...")
    if not csrf_token:
        print("SKIPPING: No CSRF token available.")
    else:
        post_data = json.dumps({
            "name": "Test Validator",
            "email": "test@gmail.com",
            "subject": "Deep System Validation",
            "message": "This is a test message to validate end-to-end write capabilities.",
            "is_bug_report": False
        }).encode('utf-8')

        req = urllib.request.Request(f"{BASE_URL}/contact/", data=post_data, method='POST')
        req.add_header('Content-Type', 'application/json')
        req.add_header('X-CSRFToken', csrf_token)
        req.add_header('Cookie', cookie)

        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 201 or response.status == 200:
                data = json.loads(response.read().decode())
                print(f"SUCCESS: Message saved to database!")
            else:
                print(f"Unexpected status: {response.status}")
except urllib.error.HTTPError as e:
    print(f"FAILED HTTP ERROR {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"FAILED: {e}")

print("\n--- VALIDATION COMPLETE ---")
