from google.adk.agents import Agent
from google.adk.tools import AgentTool

from ... import MODEL
from . import nvmau_prompt

# Import CEO and VPs for routing
from ..executive.ceo import CEOAgent
from ..executive.dcthanh import DoChiThanhAgent
from ..executive.dmson import DuongManhSonAgent
from ..executive.lxhuyen import LeXuanHuyenAgent
from ..executive.ptgiang import PhanTuGiangAgent
from ..executive.lmcuong import LeManhCuongAgent

NguyenVanMauAgent = Agent(
    model=MODEL,
    name="nvmau",
    description="Thành viên Hội đồng Thành viên PVN - Ủy viên độc lập",
    instruction=nvmau_prompt.PROMPT,
    tools=[
        # CEO and VPs for routing
        AgentTool(agent=CEOAgent),
        AgentTool(agent=DoChiThanhAgent),
        AgentTool(agent=DuongManhSonAgent),
        AgentTool(agent=LeXuanHuyenAgent),
        AgentTool(agent=PhanTuGiangAgent),
        AgentTool(agent=LeManhCuongAgent),
    ],
    sub_agents=[]
)