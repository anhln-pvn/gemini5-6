from google.adk.agents import Agent

from ... import MODEL
from . import khcncds_prompt

KHCNCDSAgent = Agent(
    model=MODEL,
    name="khcncds",
    description="Ban Khoa học - Công nghệ và Chuyển đổi số (KHCNCDS - Science, Technology & Digital Transformation Division)",
    instruction=khcncds_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_khcncds"
)
