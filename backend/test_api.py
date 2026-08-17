import requests

BASE_URL = "http://localhost:8000/api"

def test_api():
    print("Testing /health...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, "Health check failed"
    print(r.json())

    print("\nTesting create game...")
    r = requests.post(f"{BASE_URL}/games", json={"category": "objects", "mode": "20-questions"})
    assert r.status_code == 200, "Create game failed"
    game = r.json()
    game_id = game["game_id"]
    print(game)

    print("\nTesting get game...")
    r = requests.get(f"{BASE_URL}/games/{game_id}")
    assert r.status_code == 200, "Get game failed"
    print(r.json())

    print("\nTesting answer...")
    r = requests.post(f"{BASE_URL}/games/{game_id}/answers", json={"answer": "yes"})
    assert r.status_code == 200, "Submit answer failed"
    print(r.json())

    print("\nForcing guess state...")
    for _ in range(19):
        r = requests.post(f"{BASE_URL}/games/{game_id}/answers", json={"answer": "no"})
    
    game = r.json()
    print("State after 20 answers:", game["status"])

    print("\nTesting confirm guess...")
    r = requests.post(f"{BASE_URL}/games/{game_id}/guess/confirm", json={"correct": True})
    assert r.status_code == 200, "Confirm guess failed"
    print(r.json())

    print("\nAll tests passed!")

if __name__ == "__main__":
    test_api()
