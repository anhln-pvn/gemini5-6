# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""CEO Agent."""

from google.adk.agents import Agent
from google.adk.tools import AgentTool

from ... import MODEL
from . import ceo_prompt
from ...tools.workflow_tools import load_workflow_plan

# Import agents directly to avoid circular imports
from ..executive.dcthanh import DoChiThanhAgent
from ..executive.dmson import DuongManhSonAgent
from ..executive.lxhuyen import LeXuanHuyenAgent
from ..executive.ptgiang import PhanTuGiangAgent
from ..executive.lmcuong import LeManhCuongAgent

# Division agents
from ..division.qtnnl import QTNNLAgent
from ..division.ktdt import KTĐTAgent
from ..division.qtrr import QTRRAgent
from ..division.tdkt import TDKTAgent
from ..division.tkdk import TKDKAgent
from ..division.cnklhd import CNKLHDAgent
from ..division.dnltt import DNLTTAgent
from ..division.khcncds import KHCNCDSAgent
from ..division.atmt import ATMTAgent
from ..division.tmdv import TMDVAgent
from ..division.tckt import TCKTAgent
from ..division.pcdt import PCĐTAgent
from ..division.ttvhdn import TTVHDNAgent
from ..division.qlhd import QLHDAgent
from ..division.cl import CLAgent
from ..division.knsb import KNSBAgent
from ..division.th import THAgent

CEOAgent = Agent(
    model=MODEL,
    name="le_ngoc_son",
    description="Tổng Giám đốc PVN - Lãnh đạo chỉ đạo toàn diện, chiến lược, nhân sự, quản trị rủi ro, hợp tác quốc tế",
    instruction=ceo_prompt.PROMPT,
    tools=[
        load_workflow_plan,
        # VP Agents
        AgentTool(agent=DoChiThanhAgent),
        AgentTool(agent=DuongManhSonAgent),
        AgentTool(agent=LeXuanHuyenAgent),
        AgentTool(agent=PhanTuGiangAgent),
        AgentTool(agent=LeManhCuongAgent),
        # Division Agents
        AgentTool(agent=QTNNLAgent),
        AgentTool(agent=KTĐTAgent),
        AgentTool(agent=QTRRAgent),
        AgentTool(agent=TDKTAgent),
        AgentTool(agent=TKDKAgent),
        AgentTool(agent=CNKLHDAgent),
        AgentTool(agent=DNLTTAgent),
        AgentTool(agent=KHCNCDSAgent),
        AgentTool(agent=ATMTAgent),
        AgentTool(agent=TMDVAgent),
        AgentTool(agent=TCKTAgent),
        AgentTool(agent=PCĐTAgent),
        AgentTool(agent=TTVHDNAgent),
        AgentTool(agent=QLHDAgent),
        AgentTool(agent=CLAgent),
        AgentTool(agent=KNSBAgent),
        AgentTool(agent=THAgent),
    ],
    sub_agents=[],  # No sub-agents, using AgentTool for flexible routing
    output_key="ceo_instruction"
)
