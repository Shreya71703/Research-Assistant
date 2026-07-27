"""
Tool implementations for the Research Assistant agent.
Integrated Tools:
1. DuckDuckGo Web Search
2. Open-Meteo Weather Telemetry
3. NewsAPI Global News
4. Safe Math Evaluator
5. ArXiv Academic Paper Search
6. GitHub Open Source Repo Search
7. Wikipedia Summary Lookup
"""
import asyncio
from typing import Any
import httpx
from datetime import datetime
import re
import logging
import os
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

# Initialize shared HTTP client
http_client = httpx.AsyncClient(timeout=10.0, headers={"User-Agent": "ResearchAssistant/1.0"})


async def search_web(query: str) -> dict[str, Any]:
    """Search the web using DuckDuckGo."""
    try:
        try:
            try:
                from ddgs import DDGS
            except ImportError:
                from duckduckgo_search import DDGS
            
            results = []
            with DDGS() as ddgs:
                for r in ddgs.text(query, max_results=5):
                    results.append({
                        "source": "DuckDuckGo",
                        "title": r.get("title", ""),
                        "snippet": r.get("body", "")[:300],
                        "url": r.get("href", "")
                    })
            
            if results:
                return {
                    "status": "success",
                    "query": query,
                    "result_count": len(results),
                    "results": results
                }
        except ImportError:
            logger.warning("duckduckgo-search not installed, using instant answer API fallback")
        except Exception as e:
            logger.warning(f"duckduckgo-search failed ({e}), falling back to instant answer API")
        
        url = "https://api.duckduckgo.com"
        params = {
            "q": query,
            "format": "json",
            "no_html": 1,
        }
        
        response = await http_client.get(url, params=params, timeout=5.0)
        data = response.json()
        results = []
        
        if data.get("AbstractText"):
            results.append({
                "source": "DuckDuckGo Abstract",
                "title": data.get("Heading", query),
                "snippet": data.get("AbstractText", "")[:300],
                "url": data.get("AbstractURL", "")
            })
        
        for topic in data.get("RelatedTopics", [])[:5]:
            if "Text" in topic:
                results.append({
                    "source": "Related",
                    "title": topic.get("FirstURL", "").split("/")[-1] or "Result",
                    "snippet": topic.get("Text", "")[:300],
                    "url": topic.get("FirstURL", "")
                })
        
        if not results:
            results.append({
                "source": "DuckDuckGo",
                "title": "No direct results",
                "snippet": f"Search for '{query}' returned limited info. Try a more specific query.",
                "url": f"https://duckduckgo.com/?q={query}"
            })
        
        return {
            "status": "success",
            "query": query,
            "result_count": len(results),
            "results": results
        }
        
    except asyncio.TimeoutError:
        return {"status": "error", "error": "Web search timed out (5s limit)", "query": query}
    except Exception as e:
        return {"status": "error", "error": str(e), "query": query}


async def get_weather(location: str) -> dict[str, Any]:
    """Get current weather for a location using Open-Meteo API."""
    try:
        geocode_url = "https://geocoding-api.open-meteo.com/v1/search"
        geocode_params = {"name": location, "count": 1, "language": "en", "format": "json"}
        
        geocode_response = await http_client.get(geocode_url, params=geocode_params, timeout=5.0)
        geocode_data = geocode_response.json()
        
        if not geocode_data.get("results"):
            return {"status": "error", "error": f"Location '{location}' not found", "location": location}
        
        result = geocode_data["results"][0]
        lat, lon = result["latitude"], result["longitude"]
        place_name = f"{result.get('name', location)}, {result.get('country', '')}"
        
        weather_url = "https://api.open-meteo.com/v1/forecast"
        weather_params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m",
            "timezone": "auto"
        }
        
        weather_response = await http_client.get(weather_url, params=weather_params, timeout=5.0)
        weather_data = weather_response.json()
        current = weather_data.get("current", {})
        
        weather_code = current.get("weather_code", 0)
        weather_desc = _decode_weather_code(weather_code)
        
        return {
            "status": "success",
            "location": place_name,
            "temperature_celsius": current.get("temperature_2m"),
            "temperature_fahrenheit": round((current.get("temperature_2m", 0) * 9/5) + 32, 1),
            "condition": weather_desc,
            "humidity": f"{current.get('relative_humidity_2m')}%",
            "wind_speed_kmh": current.get("wind_speed_10m"),
            "timestamp": current.get("time", datetime.now().isoformat())
        }
        
    except asyncio.TimeoutError:
        return {"status": "error", "error": "Weather lookup timed out (5s limit)", "location": location}
    except Exception as e:
        return {"status": "error", "error": str(e), "location": location}


async def get_news(topic: str, limit: int = 3, api_key: str = None) -> dict[str, Any]:
    """Get latest news using NewsAPI."""
    if not api_key:
        return {
            "status": "fallback",
            "message": "NewsAPI key not configured (optional). To enable, set NEWS_API_KEY in .env",
            "topic": topic,
            "articles": []
        }
    
    try:
        url = "https://newsapi.org/v2/everything"
        params = {"q": topic, "sortBy": "publishedAt", "pageSize": limit, "apiKey": api_key, "language": "en"}
        
        response = await http_client.get(url, params=params, timeout=5.0)
        data = response.json()
        
        if data.get("status") != "ok":
            return {"status": "error", "error": data.get("message", "NewsAPI error"), "topic": topic}
        
        articles = []
        for article in data.get("articles", [])[:limit]:
            articles.append({
                "title": article.get("title", ""),
                "source": article.get("source", {}).get("name", "Unknown"),
                "published": article.get("publishedAt", "")[:10],
                "url": article.get("url", ""),
                "description": article.get("description", "")[:150]
            })
        
        return {
            "status": "success",
            "topic": topic,
            "article_count": len(articles),
            "articles": articles
        }
        
    except asyncio.TimeoutError:
        return {"status": "error", "error": "News API timed out (5s limit)", "topic": topic}
    except Exception as e:
        return {"status": "error", "error": str(e), "topic": topic}


def calculate(expression: str) -> dict[str, Any]:
    """Safely evaluate a mathematical expression."""
    try:
        sanitized = expression.replace("^", "**")
        if not re.match(r"^[\d+\-*/().\s*]+$", sanitized):
            return {
                "status": "error",
                "error": "Invalid characters. Only numbers, operators (+, -, *, /, ^), and parentheses allowed.",
                "expression": expression
            }
        
        result = eval(sanitized)
        return {
            "status": "success",
            "expression": expression,
            "result": result,
            "result_type": "float" if isinstance(result, float) else "int"
        }
    except ZeroDivisionError:
        return {"status": "error", "error": "Division by zero", "expression": expression}
    except SyntaxError:
        return {"status": "error", "error": "Invalid mathematical expression", "expression": expression}
    except Exception as e:
        return {"status": "error", "error": str(e), "expression": expression}


async def search_arxiv(query: str, max_results: int = 3) -> dict[str, Any]:
    """
    Search ArXiv for academic research papers (free, no API key required).
    
    Args:
        query: Research query string (e.g., "transformer architecture", "reinforcement learning")
        max_results: Max papers to return
    """
    try:
        url = "https://export.arxiv.org/api/query"
        params = {
            "search_query": f"all:{query}",
            "start": 0,
            "max_results": max_results,
            "sortBy": "relevance",
            "sortOrder": "descending"
        }
        
        response = await http_client.get(url, params=params, timeout=8.0)
        
        # Parse Atom XML
        root = ET.fromstring(response.text)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        
        papers = []
        for entry in root.findall("atom:entry", ns):
            title = entry.find("atom:title", ns)
            summary = entry.find("atom:summary", ns)
            published = entry.find("atom:published", ns)
            id_url = entry.find("atom:id", ns)
            
            authors = [a.find("atom:name", ns).text for a in entry.findall("atom:author", ns) if a.find("atom:name", ns) is not None]
            
            papers.append({
                "title": title.text.strip().replace("\n", " ") if title is not None else "Untitled",
                "authors": authors[:3],
                "published": published.text[:10] if published is not None else "",
                "summary": summary.text.strip().replace("\n", " ")[:350] + "..." if summary is not None else "",
                "url": id_url.text if id_url is not None else ""
            })
            
        return {
            "status": "success",
            "query": query,
            "paper_count": len(papers),
            "papers": papers
        }
    except asyncio.TimeoutError:
        return {"status": "error", "error": "ArXiv API lookup timed out (8s limit)", "query": query}
    except Exception as e:
        return {"status": "error", "error": str(e), "query": query}


async def search_github(query: str, limit: int = 4) -> dict[str, Any]:
    """
    Search GitHub for top open source repositories matching a topic or search term.
    
    Args:
        query: Repository search term (e.g., "LangGraph", "FastAPI RAG")
        limit: Number of repositories to return
    """
    try:
        url = "https://api.github.com/search/repositories"
        params = {
            "q": query,
            "sort": "stars",
            "order": "desc",
            "per_page": limit
        }
        headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "ResearchAssistantApp"}
        
        response = await http_client.get(url, params=params, headers=headers, timeout=6.0)
        data = response.json()
        
        items = data.get("items", [])
        repos = []
        for item in items[:limit]:
            repos.append({
                "name": item.get("full_name", ""),
                "stars": item.get("stargazers_count", 0),
                "language": item.get("language", "Unknown"),
                "description": (item.get("description") or "")[:200],
                "url": item.get("html_url", "")
            })
            
        return {
            "status": "success",
            "query": query,
            "repo_count": len(repos),
            "repositories": repos
        }
    except asyncio.TimeoutError:
        return {"status": "error", "error": "GitHub API timed out (6s limit)", "query": query}
    except Exception as e:
        return {"status": "error", "error": str(e), "query": query}


async def search_wikipedia(title_or_query: str) -> dict[str, Any]:
    """
    Get encyclopedic summary and key details for a topic from Wikipedia.
    
    Args:
        title_or_query: Topic or entity name (e.g., "Artificial Intelligence", "Quantum Computing")
    """
    try:
        clean_title = title_or_query.strip().title().replace(' ', '_')
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{clean_title}"
        response = await http_client.get(url, timeout=5.0)
        
        if response.status_code != 200:
            # Fallback search query
            search_url = "https://en.wikipedia.org/w/api.php"
            params = {
                "action": "query",
                "list": "search",
                "srsearch": title_or_query,
                "format": "json"
            }
            search_res = await http_client.get(search_url, params=params, timeout=5.0)
            search_data = search_res.json()
            results = search_data.get("query", {}).get("search", [])
            
            if not results:
                return {"status": "error", "error": f"No Wikipedia entry found for '{title_or_query}'", "query": title_or_query}
            
            first_title = results[0]["title"].replace(' ', '_')
            url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{first_title}"
            response = await http_client.get(url, timeout=5.0)

        data = response.json()
        
        return {
            "status": "success",
            "title": data.get("title", title_or_query),
            "summary": data.get("extract", "")[:500],
            "url": data.get("content_urls", {}).get("desktop", {}).get("page", f"https://en.wikipedia.org/wiki/{clean_title}")
        }
    except asyncio.TimeoutError:
        return {"status": "error", "error": "Wikipedia API timed out (5s limit)", "query": title_or_query}
    except Exception as e:
        return {"status": "error", "error": str(e), "query": title_or_query}


def _decode_weather_code(code: int) -> str:
    """WMO weather code interpretation."""
    codes = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Foggy", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
        55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains",
        80: "Slight rain showers", 81: "Moderate rain showers", 82: "Violent rain showers",
        85: "Slight snow showers", 86: "Heavy snow showers", 95: "Thunderstorm",
        96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    }
    return codes.get(code, f"Unknown code {code}")


# Tool registry for agent
TOOLS = {
    "search_web": {
        "callable": search_web,
        "description": "Search the web for general information",
        "args": {"query": "string"},
        "is_async": True
    },
    "get_weather": {
        "callable": get_weather,
        "description": "Get current weather for a location",
        "args": {"location": "string (city name)"},
        "is_async": True
    },
    "get_news": {
        "callable": get_news,
        "description": "Get latest news about a topic",
        "args": {"topic": "string"},
        "is_async": True
    },
    "calculate": {
        "callable": calculate,
        "description": "Perform mathematical calculations",
        "args": {"expression": "string (e.g., '2 + 3 * 5')"},
        "is_async": False
    },
    "search_arxiv": {
        "callable": search_arxiv,
        "description": "Search ArXiv for scientific & AI research papers",
        "args": {"query": "string"},
        "is_async": True
    },
    "search_github": {
        "callable": search_github,
        "description": "Search GitHub for top open source repositories",
        "args": {"query": "string"},
        "is_async": True
    },
    "search_wikipedia": {
        "callable": search_wikipedia,
        "description": "Get encyclopedic summaries and definitions from Wikipedia",
        "args": {"title_or_query": "string"},
        "is_async": True
    }
}
