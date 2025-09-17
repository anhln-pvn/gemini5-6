from google.adk.agents import Agent

from ... import MODEL
from . import ttvhdn_prompt

TTVHDNAgent = Agent(
    model=MODEL,
    name="ttvhdn",
    description="Ban Truyền thông - Văn hóa doanh nghiệp (TTVHDN - Communication & Corporate Culture Division)",
    instruction=ttvhdn_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_ttvhdn"
)
