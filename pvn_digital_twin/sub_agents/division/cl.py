from google.adk.agents import Agent

from ... import MODEL
from . import cl_prompt

CLAgent = Agent(
    model=MODEL,
    name="cl",
    description="Ban Chiến lược (CL - Strategy Division)",
    instruction=cl_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_cl"
)
