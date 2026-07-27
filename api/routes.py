"""
API routes for the agent.
Includes both batch and streaming (SSE) endpoints.
"""
import asyncio
import json
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from agent.schemas import AgentQueryRequest, AgentQueryResponse
from agent.graph import run_agent, run_agent_streaming

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/query", response_model=AgentQueryResponse)
async def query_agent(request: AgentQueryRequest) -> AgentQueryResponse:
    """
    Send a query to the agent and get a tool-using response (batch mode).
    
    The agent will automatically decide which tools to use based on the query:
    - `web_search`: For factual information, current events, etc.
    - `weather`: For weather queries
    - `news`: For news and current events
    - `math`: For mathematical expressions
    
    Example queries:
    - "What's the weather in London and find me news about climate change?"
    - "Calculate 2^10 and search for machine learning trends"
    - "What's the capital of France and what's the weather there?"
    """
    
    try:
        logger.info(f"Agent query: {request.query}")
        
        # Run the agent
        response_text, tool_calls, iterations, execution_time = await run_agent(
            query=request.query,
            max_iterations=request.max_iterations,
            timeout=request.timeout
        )
        
        logger.info(
            f"Agent response complete. "
            f"Iterations: {iterations}, Time: {execution_time:.2f}s, "
            f"Tools used: {len(tool_calls)}"
        )
        
        return AgentQueryResponse(
            query=request.query,
            response=response_text,
            tool_calls=tool_calls,  # type: ignore
            iterations=iterations,
            execution_time_seconds=round(execution_time, 2),
            status="success"
        )
        
    except asyncio.TimeoutError:
        logger.error(f"Agent query timed out after {request.timeout}s")
        raise HTTPException(
            status_code=408,
            detail=f"Agent query timed out after {request.timeout}s. Try increasing timeout."
        )
    except ValueError as e:
        if "API_KEY" in str(e):
            logger.error(f"Missing API configuration: {e}")
            raise HTTPException(
                status_code=500,
                detail="Server misconfiguration: Missing LLM API key. Set GROQ_API_KEY or OPENAI_API_KEY."
            )
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


@router.post("/stream")
async def stream_agent(request: AgentQueryRequest):
    """
    Send a query to the agent and receive Server-Sent Events (SSE) as it works.
    
    Events emitted:
    - `thinking`: Agent is processing (data: {"message": "..."})
    - `tool_start`: Tool execution starting (data: {"tool": "...", "input": {...}})
    - `tool_result`: Tool execution complete (data: {"tool": "...", "output": {...}, "execution_time_ms": ...})
    - `response`: Final synthesized answer (data: {"content": "..."})
    - `done`: All processing complete (data: {"iterations": ..., "execution_time_seconds": ...})
    - `error`: An error occurred (data: {"message": "..."})
    """
    
    async def event_generator():
        try:
            async for event in run_agent_streaming(
                query=request.query,
                max_iterations=request.max_iterations,
                timeout=request.timeout
            ):
                event_type = event.get("event", "message")
                event_data = json.dumps(event.get("data", {}))
                yield f"event: {event_type}\ndata: {event_data}\n\n"
        except Exception as e:
            logger.error(f"SSE stream error: {e}", exc_info=True)
            error_data = json.dumps({"message": str(e)})
            yield f"event: error\ndata: {error_data}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
