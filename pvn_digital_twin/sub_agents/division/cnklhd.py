from google.adk.agents import Agent

from ... import MODEL
from . import cnklhd_prompt

CNKLHDAgent = Agent(
    model=MODEL,
    name="cnklhd",
    description="Ban Công nghiệp khí và Lọc hóa dầu (CNKLHD - Gas and Petrochemical Division)",
    instruction=cnklhd_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_cnklhd"
)
