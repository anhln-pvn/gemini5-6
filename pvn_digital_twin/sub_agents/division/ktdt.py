from google.adk.agents import Agent

from ... import MODEL
from . import ktdt_prompt

KTĐTAgent = Agent(
    model=MODEL,
    name="ktdt",
    description="Ban Kinh tế - Đầu tư (KTĐT - Corporate Planning Division)",
    instruction=ktdt_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_ktdt"
)
