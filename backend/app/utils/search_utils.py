# app/utils/search_utils.py
import requests
import os

def search_web(query: str, num_results: int = 3):
    """
    Uses DuckDuckGo's free API to get quick factual snippets.
    No API key required.
    """
    try:
        response = requests.get(
            f"https://api.duckduckgo.com/?q={query}&format=json&no_redirect=1&no_html=1"
        )
        data = response.json()
        results = []

        # Collect abstract and related topics
        if "AbstractText" in data and data["AbstractText"]:
            results.append(data["AbstractText"])

        if "RelatedTopics" in data:
            for topic in data["RelatedTopics"]:
                if isinstance(topic, dict) and "Text" in topic:
                    results.append(topic["Text"])

        return results[:num_results] if results else ["No factual info found."]
    except Exception as e:
        return [f"Search error: {e}"]
