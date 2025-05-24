#!/usr/bin/env python3
"""
Test script for the add_session_doc endpoint
"""
import requests
import json
import base64

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_add_session_doc():
    """Test the add_session_doc endpoint"""

    # Step 1: Create a new session
    print("1. Creating a new session...")
    session_response = requests.post(f"{BASE_URL}/session")

    if session_response.status_code != 200:
        print(f"Failed to create session: {session_response.status_code}")
        print(session_response.text)
        return

    session_data = session_response.json()
    session_id = session_data["session_id"]
    print(f"   Created session with ID: {session_id}")

    # Step 2: Create some sample base64 encoded data (simulating images)
    print("2. Preparing test base64 data...")

    # Create some sample base64 data (this would normally be actual image data)
    sample_text = "This is a sample image data"
    sample_base64 = base64.b64encode(sample_text.encode()).decode()

    sample_text2 = "This is another sample image data"
    sample_base64_2 = base64.b64encode(sample_text2.encode()).decode()

    test_docs = [sample_base64, sample_base64_2]
    print(f"   Prepared {len(test_docs)} base64 documents")

    # Step 3: Test adding documents to the session
    print("3. Adding documents to session...")

    doc_payload = {
        "base64Docs": test_docs
    }

    doc_response = requests.post(
        f"{BASE_URL}/session/{session_id}/doc",
        json=doc_payload,
        headers={"Content-Type": "application/json"}
    )

    if doc_response.status_code == 200:
        result = doc_response.json()
        print(f"   ✅ Successfully added documents: {result}")
    else:
        print(f"   ❌ Failed to add documents: {doc_response.status_code}")
        print(f"   Error: {doc_response.text}")
        return

    # Step 4: Test error cases
    print("4. Testing error cases...")

    # Test with non-existent session
    print("   Testing with non-existent session...")
    error_response = requests.post(
        f"{BASE_URL}/session/999999/doc",
        json=doc_payload,
        headers={"Content-Type": "application/json"}
    )

    if error_response.status_code == 404:
        print("   ✅ Correctly returned 404 for non-existent session")
    else:
        print(f"   ❌ Expected 404, got {error_response.status_code}")

    # Test with empty documents
    print("   Testing with empty documents...")
    empty_payload = {"base64Docs": []}
    empty_response = requests.post(
        f"{BASE_URL}/session/{session_id}/doc",
        json=empty_payload,
        headers={"Content-Type": "application/json"}
    )

    if empty_response.status_code == 400:
        print("   ✅ Correctly returned 400 for empty documents")
    else:
        print(f"   ❌ Expected 400, got {empty_response.status_code}")

    # Test with invalid base64
    print("   Testing with invalid base64...")
    invalid_payload = {"base64Docs": ["invalid_base64_data!!!"]}
    invalid_response = requests.post(
        f"{BASE_URL}/session/{session_id}/doc",
        json=invalid_payload,
        headers={"Content-Type": "application/json"}
    )

    if invalid_response.status_code == 400:
        print("   ✅ Correctly returned 400 for invalid base64")
    else:
        print(f"   ❌ Expected 400, got {invalid_response.status_code}")

    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    try:
        test_add_session_doc()
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the server. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
