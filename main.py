#!/usr/bin/env python3
"""
CLI entry point for testing the agent directly.

Usage:
    python main.py "What is the weather in London?"
    python main.py "Calculate 2^10 and search for AI news"
    python main.py "Capital of France and weather there"
"""

import asyncio
import sys
import os
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from agent.graph import run_agent
import logging

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def main():
    """Main CLI entry point."""
    
    if len(sys.argv) < 2:
        print("Usage: python main.py '<query>'")
        print()
        print("Example queries:")
        print("  python main.py 'What is the weather in London?'")
        print("  python main.py 'Calculate 2^10 and search for AI news'")
        print("  python main.py 'What is the capital of France?'")
        sys.exit(1)
    
    query = " ".join(sys.argv[1:])
    
    print(f"\n{'='*60}")
    print(f"Query: {query}")
    print(f"{'='*60}\n")
    
    try:
        response, tool_calls, iterations, execution_time = await run_agent(
            query=query,
            max_iterations=10,
            timeout=30
        )
        
        print(f"Response:\n{response}\n")
        print(f"{'='*60}")
        print(f"Execution Summary:")
        print(f"  Iterations: {iterations}")
        print(f"  Tools used: {len(tool_calls)}")
        print(f"  Total time: {execution_time:.2f}s")
        print(f"{'='*60}\n")
        
        if tool_calls:
            print("Tool Calls:")
            for i, call in enumerate(tool_calls, 1):
                print(f"\n  {i}. {call['tool']}")
                print(f"     Input: {call['input']}")
                print(f"     Time: {call['execution_time_ms']:.0f}ms")
                if call['output'].get('status') == 'success':
                    print(f"     Status: ✓ Success")
                elif call['output'].get('status') == 'error':
                    print(f"     Status: ✗ Error - {call['output'].get('error')}")
                else:
                    print(f"     Status: {call['output'].get('status', 'unknown')}")
        
        print()
    
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        print(f"\nError: {e}\n")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
