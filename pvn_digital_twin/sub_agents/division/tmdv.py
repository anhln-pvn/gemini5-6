from google.adk.agents import Agent

from ... import MODEL
from . import tmdv_prompt

TMDVAgent = Agent(
    model=MODEL,
    name="tmdv",
    description="Ban Thương mại - Dịch vụ (TMDV - Trading & Services Division)",
    instruction=tmdv_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_tmdv"
)
