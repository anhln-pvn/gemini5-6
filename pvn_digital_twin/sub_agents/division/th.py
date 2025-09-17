from google.adk.agents import Agent

from ... import MODEL
from . import th_prompt

THAgent = Agent(
    model=MODEL,
    name="th",
    description="Ban Tổng hợp (TH - General Affairs Division)",
    instruction=th_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_th"
)
