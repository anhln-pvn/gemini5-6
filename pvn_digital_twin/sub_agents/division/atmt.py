from google.adk.agents import Agent

from ... import MODEL
from . import atmt_prompt

ATMTAgent = Agent(
    model=MODEL,
    name="atmt",
    description="Ban An toàn - Môi trường và Truyền thông (ATMT - Safety, Environment & Communication Division)",
    instruction=atmt_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_atmt"
)
