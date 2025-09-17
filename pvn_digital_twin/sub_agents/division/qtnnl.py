from google.adk.agents import Agent

from ... import MODEL
from . import qtnnl_prompt

QTNNLAgent = Agent(
    model=MODEL,
    name="qtnnl",
    description="Ban Quản trị nguồn nhân lực (QTNNL - Human Resources Division)",
    instruction=qtnnl_prompt.PROMPT,
    tools=[],
    sub_agents=[],
    output_key="proposal_qtnnl"
)
