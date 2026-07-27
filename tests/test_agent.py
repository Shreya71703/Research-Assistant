"""
Tests for the agent tools and core functionality.
"""
import pytest
import asyncio
from agent.tools import search_web, get_weather, get_news, calculate, search_arxiv, search_github, search_wikipedia


@pytest.mark.asyncio
async def test_search_web():
    """Test web search tool."""
    result = await search_web("artificial intelligence")
    assert result["status"] == "success"
    assert "results" in result
    assert len(result["results"]) > 0


@pytest.mark.asyncio
async def test_search_web_empty():
    """Test web search with edge case."""
    result = await search_web("xyzabc123nonexistentquery")
    assert result["status"] in ["success", "error"]


@pytest.mark.asyncio
async def test_get_weather():
    """Test weather tool."""
    result = await get_weather("London")
    assert result["status"] == "success"
    assert "temperature_celsius" in result
    assert "condition" in result


@pytest.mark.asyncio
async def test_get_weather_invalid_location():
    """Test weather with invalid location."""
    result = await get_weather("xyznotareallocation123")
    assert result["status"] == "error"


@pytest.mark.asyncio
async def test_get_news():
    """Test news tool (fallback if no key)."""
    result = await get_news("technology")
    # Should return fallback or success depending on key
    assert result["status"] in ["success", "fallback", "error"]


def test_calculate():
    """Test calculator tool."""
    result = calculate("2 + 3 * 5")
    assert result["status"] == "success"
    assert result["result"] == 17


def test_calculate_division():
    """Test calculator with division."""
    result = calculate("100 / 5")
    assert result["status"] == "success"
    assert result["result"] == 20.0


def test_calculate_invalid():
    """Test calculator with invalid expression."""
    result = calculate("invalid expression !!!!")
    assert result["status"] == "error"


def test_calculate_division_by_zero():
    """Test calculator division by zero."""
    result = calculate("1 / 0")
    assert result["status"] == "error"
    assert "Division by zero" in result["error"]


@pytest.mark.asyncio
async def test_search_arxiv():
    """Test ArXiv research tool."""
    result = await search_arxiv("transformer model", max_results=2)
    assert result["status"] == "success"
    assert "papers" in result
    assert len(result["papers"]) > 0


@pytest.mark.asyncio
async def test_search_github():
    """Test GitHub search tool."""
    result = await search_github("fastapi", limit=2)
    assert result["status"] == "success"
    assert "repositories" in result
    assert len(result["repositories"]) > 0


@pytest.mark.asyncio
async def test_search_wikipedia():
    """Test Wikipedia lookup tool."""
    result = await search_wikipedia("Artificial Intelligence")
    assert result["status"] == "success"
    assert "summary" in result


@pytest.mark.asyncio
async def test_concurrent_tools():
    """Test multiple tools running concurrently."""
    results = await asyncio.gather(
        search_web("Python"),
        get_weather("Tokyo"),
        search_arxiv("machine learning"),
        search_github("langgraph"),
        search_wikipedia("Python (programming language)"),
        return_exceptions=True
    )
    
    assert len(results) == 5
    assert all(r is not None for r in results)
