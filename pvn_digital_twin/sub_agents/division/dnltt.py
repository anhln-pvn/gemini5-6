from google.adk.agents import Agent

from ... import MODEL
from . import dnltt_prompt

DNLTTAgent = Agent(
    model=MODEL,
    name="dnltt",
    description="Ban Điện và Năng lượng tái tạo (Đ&NLTT - Power and Renewable energy)",
    instruction=dnltt_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_dnltt"
)
