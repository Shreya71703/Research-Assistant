"""
LangGraph agent definition for tool-using orchestration.
Supports both batch and streaming execution modes.
"""
import inspect
import asyncio
import time
from typing import Any, Optional, AsyncGenerator
from datetime import datetime
import json
import logging
import os

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from typing_extensions import TypedDict

from .tools import search_web, get_weather, get_news, calculate, search_arxiv, search_github, search_wikipedia

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """Agent state for LangGraph."""
    messages: list[BaseMessage]
    iteration: int
    tool_call_history: list[dict[str, Any]]
    start_time: float


def _create_tools_for_langchain():
    """Create LangChain Tool objects from our tool functions."""
    
    @tool
    async def web_search(query: str) -> str:
        """Search the web for general information on any topic."""
        result = await search_web(query)
        return json.dumps(result)
    
    @tool
    async def weather(location: str) -> str:
        """Get current weather for a city or location."""
        result = await get_weather(location)
        return json.dumps(result)
    
    @tool
    async def news(topic: str) -> str:
        """Get latest news articles about a topic."""
        result = await get_news(topic, api_key=os.getenv("NEWS_API_KEY"))
        return json.dumps(result)
    
    @tool
    def math(expression: str) -> str:
        """Perform mathematical calculations. Example: '2^10 + 5' or '(100 / 3) * 2'"""
        result = calculate(expression)
        return json.dumps(result)
    
    @tool
    async def arxiv(query: str) -> str:
        """Search ArXiv for scientific, computer science, and AI research papers. Use this for academic research queries."""
        result = await search_arxiv(query)
        return json.dumps(result)
        
    @tool
    async def github(query: str) -> str:
        """Search GitHub for top open source code repositories, libraries, and frameworks matching a topic."""
        result = await search_github(query)
        return json.dumps(result)
        
    @tool
    async def wikipedia(title_or_query: str) -> str:
        """Get encyclopedic summaries, entity definitions, and historical context from Wikipedia."""
        result = await search_wikipedia(title_or_query)
        return json.dumps(result)
    
    return [web_search, weather, news, math, arxiv, github, wikipedia]


from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage

def _get_llm():
    """Initialize LLM based on env vars."""
    raw_groq_key = os.getenv("GROQ_API_KEY")
    raw_openai_key = os.getenv("OPENAI_API_KEY")
    model_name = os.getenv("LLM_MODEL")
    
    if raw_groq_key:
        clean_groq_key = raw_groq_key.strip().strip("'\"")
        return ChatGroq(
            model=model_name or "llama-3.3-70b-versatile",
            temperature=0,
            api_key=clean_groq_key,
            max_retries=3,
            request_timeout=60.0
        )
    elif raw_openai_key:
        clean_openai_key = raw_openai_key.strip().strip("'\"")
        return ChatOpenAI(
            model=model_name or "gpt-4-turbo",
            temperature=0,
            api_key=clean_openai_key,
            max_retries=3,
            request_timeout=60.0
        )
    else:
        raise ValueError(
            "Neither GROQ_API_KEY nor OPENAI_API_KEY set. "
            "Set at least one in environment variables."
        )


# Cache the tools list at module level
_tools_cache = None

def _get_tools():
    """Get or create cached tools list."""
    global _tools_cache
    if _tools_cache is None:
        _tools_cache = _create_tools_for_langchain()
    return _tools_cache


def create_agent_graph():
    """
    Create the LangGraph agent with tool-use capabilities.
    
    Returns:
        Compiled agent runnable
    """
    
    # Initialize LLM and tools
    llm = _get_llm()
    tools = _get_tools()
    
    # Bind tools to LLM
    llm_with_tools = llm.bind_tools(tools)
    
    # Create graph
    graph = StateGraph(AgentState)
    
    # Define nodes
    async def agent_node(state: AgentState) -> AgentState:
        """Agentic loop: decide action (tool or respond)."""
        messages = state["messages"]
        
        # Call LLM
        response = await llm_with_tools.ainvoke(messages)
        
        return {
            "messages": messages + [response],
            "iteration": state["iteration"],
            "tool_call_history": state["tool_call_history"],
            "start_time": state["start_time"],
        }
    
    async def tool_node(state: AgentState) -> AgentState:
        """Execute tools and return results."""
        messages = state["messages"]
        tool_call_history = list(state["tool_call_history"])
        
        # Get last AI message
        last_ai_message = messages[-1]
        tool_calls = last_ai_message.tool_calls or []
        
        # Execute tools
        tool_results = []
        
        for tc in tool_calls:
            tool_name = tc["name"]
            tool_input = tc["args"]
            tool_call_id = tc.get("id")
            
            tool_start = time.time()
            
            try:
                # Find the tool
                tool_obj = next((t for t in tools if t.name == tool_name), None)
                if not tool_obj:
                    result_str = json.dumps({"status": "error", "error": f"Tool {tool_name} not found"})
                else:
                    # Execute (handle both async and sync)
                    if inspect.iscoroutinefunction(tool_obj.coroutine):
                        result_str = await tool_obj.coroutine(**tool_input)
                    elif inspect.iscoroutinefunction(tool_obj.func):
                        result_str = await tool_obj.func(**tool_input)
                    else:
                        result_str = tool_obj.func(**tool_input)
            except Exception as e:
                logger.error(f"Tool {tool_name} error: {e}")
                result_str = json.dumps({"status": "error", "error": str(e)})
            
            execution_time = time.time() - tool_start
            
            # Parse result for history
            try:
                result_parsed = json.loads(result_str) if isinstance(result_str, str) else result_str
            except (json.JSONDecodeError, TypeError):
                result_parsed = {"raw": str(result_str)}
            
            # Record in history
            tool_call_history.append({
                "tool": tool_name,
                "input": tool_input,
                "output": result_parsed,
                "execution_time_ms": round(execution_time * 1000, 1),
            })
            
            # Create tool message
            content = result_str if isinstance(result_str, str) else json.dumps(result_str)
            tool_message = ToolMessage(
                content=content,
                tool_call_id=tool_call_id,
                name=tool_name
            )
            tool_results.append(tool_message)
        
        return {
            "messages": messages + tool_results,
            "iteration": state["iteration"] + 1,
            "tool_call_history": tool_call_history,
            "start_time": state["start_time"],
        }
    
    # Define edges
    def should_continue(state: AgentState) -> str:
        """Router: continue if tools called, else end."""
        messages = state["messages"]
        last_message = messages[-1]
        
        # If tool calls exist, continue to tools
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        
        # Otherwise, done
        return END
    
    # Add nodes to graph
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)
    
    # Add edges
    graph.set_entry_point("agent")
    graph.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            END: END,
        }
    )
    graph.add_edge("tools", "agent")
    
    return graph.compile()


async def run_agent(
    query: str,
    max_iterations: int = 10,
    timeout: int = 30
) -> tuple[str, list[dict[str, Any]], int, float]:
    """
    Run the agent on a query (batch mode).
    
    Args:
        query: User query
        max_iterations: Max tool call rounds
        timeout: Total timeout in seconds
        
    Returns:
        (final_response, tool_calls, iterations_used, execution_time)
    """
    
    start_time = time.time()
    agent = create_agent_graph()
    
    # Initial state
    initial_state = {
        "messages": [
            SystemMessage(content="You are an intelligent tool-using research assistant agent. Use the provided tools when needed to fulfill queries accurately."),
            HumanMessage(content=query)
        ],
        "iteration": 0,
        "tool_call_history": [],
        "start_time": start_time,
    }
    
    try:
        final_state = await asyncio.wait_for(
            agent.ainvoke(initial_state),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        return (
            f"Agent query timed out after {timeout}s",
            [],
            0,
            time.time() - start_time
        )
    except Exception as e:
        logger.error(f"Agent error: {e}", exc_info=True)
        return (
            f"Agent error: {str(e)}",
            [],
            0,
            time.time() - start_time
        )
    
    # Extract final response
    messages = final_state["messages"]
    final_message = messages[-1]
    
    if isinstance(final_message, AIMessage):
        response = final_message.content
    else:
        response = str(final_message)
    
    return (
        response,
        final_state["tool_call_history"],
        final_state["iteration"],
        time.time() - start_time
    )


async def run_agent_streaming(
    query: str,
    max_iterations: int = 10,
    timeout: int = 30
) -> AsyncGenerator[dict[str, Any], None]:
    """
    Run the agent on a query with streaming events.
    
    Yields SSE-compatible event dicts:
        {"event": "thinking", "data": {"message": "..."}}
        {"event": "tool_start", "data": {"tool": "...", "input": {...}}}
        {"event": "tool_result", "data": {"tool": "...", "output": {...}, "execution_time_ms": ...}}
        {"event": "response", "data": {"content": "..."}}
        {"event": "done", "data": {"iterations": ..., "execution_time_seconds": ...}}
        {"event": "error", "data": {"message": "..."}}
    """
    start_time = time.time()
    
    yield {"event": "thinking", "data": {"message": "Analyzing your query..."}}
    
    try:
        llm = _get_llm()
        tools = _get_tools()
        llm_with_tools = llm.bind_tools(tools)
        
        messages: list[BaseMessage] = [
            SystemMessage(content="You are an intelligent tool-using research assistant agent. Use the provided tools when needed to fulfill queries accurately."),
            HumanMessage(content=query)
        ]
        tool_call_history = []
        iteration = 0
        
        for _ in range(max_iterations):
            # Check timeout
            if time.time() - start_time > timeout:
                yield {"event": "error", "data": {"message": f"Timed out after {timeout}s"}}
                return
            
            try:
                response = await asyncio.wait_for(
                    llm_with_tools.ainvoke(messages),
                    timeout=max(5, timeout - (time.time() - start_time))
                )
            except Exception as err:
                err_str = str(err)
                if "tool_use_failed" in err_str or "BadRequestError" in str(type(err).__name__) or "400" in err_str:
                    logger.warning(f"Tool call parser fallback triggered: {err}")
                    response = await asyncio.wait_for(
                        llm.ainvoke(messages),
                        timeout=max(5, timeout - (time.time() - start_time))
                    )
                elif "Connection error" in err_str or "ConnectError" in str(type(err).__name__):
                    logger.error(f"Groq API connection error: {err}")
                    yield {"event": "error", "data": {"message": f"Groq API Connection Error ({type(err).__name__}: {err}). Please check your GROQ_API_KEY on Render."}}
                    return
                else:
                    logger.error(f"LLM execution error: {err}")
                    yield {"event": "error", "data": {"message": f"LLM Error: {err_str}"}}
                    return
            messages.append(response)
            
            # Check if LLM wants to call tools
            if not (hasattr(response, "tool_calls") and response.tool_calls):
                # No tool calls — we have our final answer
                raw_content = response.content if hasattr(response, "content") else response
                if isinstance(raw_content, list):
                    final_content = "".join(
                        item.get("text", str(item)) if isinstance(item, dict) else str(item)
                        for item in raw_content
                    )
                else:
                    final_content = str(raw_content)
                
                yield {"event": "response", "data": {"content": final_content}}
                break
            
            # Execute each tool call
            for tc in response.tool_calls:
                tool_name = tc["name"]
                tool_input = tc["args"]
                tool_call_id = tc.get("id")
                
                yield {"event": "tool_start", "data": {"tool": tool_name, "input": tool_input}}
                
                tool_start = time.time()
                
                try:
                    tool_obj = next((t for t in tools if t.name == tool_name), None)
                    if not tool_obj:
                        result_str = json.dumps({"status": "error", "error": f"Tool {tool_name} not found"})
                    else:
                        if inspect.iscoroutinefunction(tool_obj.coroutine):
                            result_str = await tool_obj.coroutine(**tool_input)
                        elif inspect.iscoroutinefunction(tool_obj.func):
                            result_str = await tool_obj.func(**tool_input)
                        else:
                            result_str = tool_obj.func(**tool_input)
                except Exception as e:
                    result_str = json.dumps({"status": "error", "error": str(e)})
                
                execution_time_ms = round((time.time() - tool_start) * 1000, 1)
                
                try:
                    result_parsed = json.loads(result_str) if isinstance(result_str, str) else result_str
                except (json.JSONDecodeError, TypeError):
                    result_parsed = {"raw": str(result_str)}
                
                tool_call_history.append({
                    "tool": tool_name,
                    "input": tool_input,
                    "output": result_parsed,
                    "execution_time_ms": execution_time_ms,
                })
                
                yield {
                    "event": "tool_result",
                    "data": {
                        "tool": tool_name,
                        "output": result_parsed,
                        "execution_time_ms": execution_time_ms
                    }
                }
                
                # Add tool message to conversation
                content = result_str if isinstance(result_str, str) else json.dumps(result_str)
                messages.append(ToolMessage(
                    content=content,
                    tool_call_id=tool_call_id,
                    name=tool_name
                ))
            
            iteration += 1
            yield {"event": "thinking", "data": {"message": "Synthesizing results..."}}
        
        # If we exited loop without breaking (e.g. after tools), fetch final response if not sent
        if messages and isinstance(messages[-1], AIMessage) and messages[-1].content:
            raw_c = messages[-1].content
            if isinstance(raw_c, list):
                fc = "".join(item.get("text", str(item)) if isinstance(item, dict) else str(item) for item in raw_c)
            else:
                fc = str(raw_c)
            if fc and not (hasattr(messages[-1], "tool_calls") and messages[-1].tool_calls):
                yield {"event": "response", "data": {"content": fc}}

        yield {
            "event": "done",
            "data": {
                "iterations": iteration,
                "execution_time_seconds": round(time.time() - start_time, 2),
                "tool_calls": tool_call_history
            }
        }
        
    except asyncio.TimeoutError:
        yield {"event": "error", "data": {"message": f"Agent timed out after {timeout}s"}}
    except Exception as e:
        logger.error(f"Streaming agent error: {e}", exc_info=True)
        yield {"event": "error", "data": {"message": str(e)}}
