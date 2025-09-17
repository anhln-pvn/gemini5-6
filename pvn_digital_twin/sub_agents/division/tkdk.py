from google.adk.agents import Agent

from ... import MODEL
from . import tkdk_prompt

TKDKAgent = Agent(
    model=MODEL,
    name="tkdk",
    description="Ban Thăm dò - Khai thác Dầu khí - Quản lý tìm kiếm, thăm dò, khai thác dầu khí và các hoạt động E&P",
    instruction=tkdk_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_tkdk"
)
