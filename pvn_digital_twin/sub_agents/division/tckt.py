from google.adk.agents import Agent

from ... import MODEL
from . import tckt_prompt

TCKTAgent = Agent(
    model=MODEL,
    name="tckt",
    description="Ban Tài chính - Kế toán (TCKT - Finance & Accounting Division)",
    instruction=tckt_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_tckt"
)
