from google.adk.agents import Agent

from ... import MODEL
from . import tdkt_prompt

TDKTAgent = Agent(
    model=MODEL,
    name="tdkt",
    description="Ban Thăm dò - Khai thác Dầu khí (TDKT - Exploration & Production Division)",
    instruction=tdkt_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_tdkt"
)
