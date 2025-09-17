from google.adk.agents import Agent

from ... import MODEL
from . import qtrr_prompt

QTRRAgent = Agent(
    model=MODEL,
    name="qtrr",
    description="Ban Quản trị rủi ro & Giám sát tuân thủ (QTRR - Risk Management & Compliance Division)",
    instruction=qtrr_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_qtrr"
)
