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

"""Agent tool utilities for PVN Digital Twin system."""

from google.adk.tools import AgentTool

def get_agent_tools(agent_names, agent_registry):
    """Get AgentTool instances for the specified agent names."""
    return [AgentTool(agent=agent_registry[name]) for name in agent_names if name in agent_registry]

def get_all_agent_tools(agent_registry):
    """Get AgentTool instances for all agents."""
    return [AgentTool(agent=agent) for agent in agent_registry.values()]

def get_executive_agent_tools(agent_registry):
    """Get AgentTool instances for all executive agents."""
    executive_agents = ["ceo", "dcthanh", "dmson", "lxhuyen", "ptgiang", "lmcuong"]
    return get_agent_tools(executive_agents, agent_registry)

def get_division_agent_tools(agent_registry):
    """Get AgentTool instances for all division agents."""
    division_agents = ["qtnnl", "ktdt", "qtrr", "tdkt", "tkdk", "cnklhd", "dnltt", "khcncds", "atmt", "tmdv", "tckt", "pcdt", "ttvhdn", "qlhd", "cl", "knsb", "th"]
    return get_agent_tools(division_agents, agent_registry)

def get_board_agent_tools(agent_registry):
    """Get AgentTool instances for all board agents."""
    board_agents = ["lmhung", "lnson", "bmtien", "nvmau", "tbminh", "ptanh", "thnam"]
    return get_agent_tools(board_agents, agent_registry)
