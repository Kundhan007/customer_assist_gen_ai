import os
from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from ..config import OPENAI_API_KEY
from .tools import AGENT_TOOLS

def get_orchestrator_agent(
    openai_api_key: str = None,
    model_name: str = "gpt-4o-mini", # Updated to a more common model
    temperature: float = 0.0,
    verbose: bool = True
):
    """
    Initializes and returns a Langchain agent configured with the project's tools.

    Args:
        openai_api_key (str, optional): The OpenAI API key.
                                       Defaults to the OPENAI_API_KEY environment variable.
        model_name (str, optional): The name of the OpenAI model to use. Defaults to "gpt-4o-mini".
        temperature (float, optional): The temperature for the LLM. Defaults to 0.0.
        verbose (bool, optional): Whether to print verbose logs from the agent. Defaults to True.

    Returns:
        langchain.agents.Agent: The initialized Langchain agent.
    """
    if not openai_api_key:
        openai_api_key = OPENAI_API_KEY

    if not openai_api_key:
        raise ValueError("OpenAI API key not found. Please set it in the .env file or pass it as an argument.")

    llm = ChatOpenAI(
        openai_api_key=openai_api_key,
        model_name=model_name,
        temperature=temperature
    )

    # Note: The AgentType might need to be updated based on LangChain versions and desired behavior.
    # STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION is a good starting point for tool use.
    agent = initialize_agent(
        tools=AGENT_TOOLS,
        llm=llm,
        agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
        verbose=verbose,
        handle_parsing_errors=True # Useful for robustness
    )

    return agent

async def run_agent(query: str, agent=None):
    """
    A convenience function to run the agent with a given query.

    Args:
        query (str): The user's query or instruction for the agent.
        agent (langchain.agents.Agent, optional): An existing agent instance.
                                                   If None, a new agent is created using get_orchestrator_agent.

    Returns:
        str: The agent's response.
    """
    if not agent:
        agent = get_orchestrator_agent()

    if not agent:
        raise RuntimeError("Agent could not be initialized.")

    try:
        # The invoke method is the modern way to run agents.
        # It expects a dictionary of inputs, typically with an "input" key.
        # Since tools are async, we use ainvoke for async invocation.
        result = await agent.ainvoke({"input": query})
        # The result from invoke is usually a dictionary, with the output under an "output" key.
        return result.get("output", "Agent did not return an output.")
    except Exception as e:
        return f"An error occurred while running the agent: {e}"
