from google.adk.agents import Agent

from ... import MODEL
from . import pcdt_prompt

PCĐTAgent = Agent(
    model=MODEL,
    name="pcdt",
    description="Ban Pháp chế - Đấu thầu (PCĐT - Legal & Procurement Division)",
    instruction=pcdt_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_pcdt"
)
