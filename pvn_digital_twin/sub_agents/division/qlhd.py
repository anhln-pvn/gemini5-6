from google.adk.agents import Agent

from ... import MODEL
from . import qlhd_prompt

QLHDAgent = Agent(
    model=MODEL,
    name="qlhd",
    description="Ban Quản lý dự án (QLHD - Project Management Division)",
    instruction=qlhd_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_qlhd"
)
