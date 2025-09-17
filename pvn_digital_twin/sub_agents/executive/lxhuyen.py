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

"""Le Xuan Huyen VP Agent."""

from google.adk.agents import Agent
from google.adk.tools import AgentTool

from ... import MODEL
from . import lxhuyen_prompt
from ...tools.workflow_tools import load_workflow_plan

# Import division agents for routing

# Import all division agents for routing
from ..division.cnklhd import CNKLHDAgent
from ..division.khcncds import KHCNCDSAgent
from ..division.tmdv import TMDVAgent
from ..division.atmt import ATMTAgent
from ..division.qtnnl import QTNNLAgent
from ..division.ktdt import KTĐTAgent
from ..division.qtrr import QTRRAgent
from ..division.tdkt import TDKTAgent
from ..division.tkdk import TKDKAgent
from ..division.dnltt import DNLTTAgent
from ..division.tckt import TCKTAgent
from ..division.pcdt import PCĐTAgent
from ..division.ttvhdn import TTVHDNAgent
from ..division.qlhd import QLHDAgent
from ..division.cl import CLAgent
from ..division.knsb import KNSBAgent
from ..division.th import THAgent

LeXuanHuyenAgent = Agent(
    model=MODEL,
    name="le_xuan_huyen",
    description="Phó TGĐ Lê Xuân Huyên - Phụ trách khí tự nhiên và lọc hóa dầu",
    instruction=lxhuyen_prompt.PROMPT,
    tools=[
        load_workflow_plan,
        # All division agents for comprehensive routing
        AgentTool(agent=CNKLHDAgent),
        AgentTool(agent=KHCNCDSAgent),
        AgentTool(agent=TMDVAgent),
        AgentTool(agent=ATMTAgent),
        AgentTool(agent=QTNNLAgent),
        AgentTool(agent=KTĐTAgent),
        AgentTool(agent=QTRRAgent),
        AgentTool(agent=TDKTAgent),
        AgentTool(agent=TKDKAgent),
        AgentTool(agent=DNLTTAgent),
        AgentTool(agent=TCKTAgent),
        AgentTool(agent=PCĐTAgent),
        AgentTool(agent=TTVHDNAgent),
        AgentTool(agent=QLHDAgent),
        AgentTool(agent=CLAgent),
        AgentTool(agent=KNSBAgent),
        AgentTool(agent=THAgent),
    ],
    sub_agents=[],  # No sub-agents, using AgentTool for flexible routing
    output_key="lxhuyen_instruction"
)
