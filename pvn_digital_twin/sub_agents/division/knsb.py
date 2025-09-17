from google.adk.agents import Agent

from ... import MODEL
from . import knsb_prompt

KNSBAgent = Agent(
    model=MODEL,
    name="knsb",
    description="Ban Kiểm soát nội bộ (KNSB - Internal Control Division)",
    instruction=knsb_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_knsb"
)
