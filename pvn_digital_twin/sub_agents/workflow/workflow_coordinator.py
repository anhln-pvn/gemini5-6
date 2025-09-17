"""Workflow coordinator agent definition."""

from __future__ import annotations

from google.adk.agents import Agent
from google.adk.tools import AgentTool

from ... import MODEL
from ...agent_registry import DIVISION_AGENTS, get_agent_registry
from ...tools.workflow_tools import (
    finalize_workflow_summary,
    load_workflow_plan,
    log_workflow_event,
)
from . import workflow_coordinator_prompt


def _build_toolkit():
    """Construct AgentTools for agents required in workflow orchestration."""
    registry = get_agent_registry()
    base_agents = {
        "vp",
        "th",
        "do_chi_thanh",
        "duong_manh_son",
        "le_xuan_huyen",
        "phan_tu_giang",
        "le_manh_cuong",
        "le_ngoc_son",
    }
    # Include every division agent to allow comprehensive consultation steps.
    agent_names = sorted(base_agents.union(DIVISION_AGENTS))

    tools = [
        AgentTool(agent=registry[name])
        for name in agent_names
        if name in registry
    ]
    return tools


WORKFLOW_TOOLS = _build_toolkit()
WORKFLOW_FUNCTION_TOOLS = [
    load_workflow_plan,
    log_workflow_event,
    finalize_workflow_summary,
]

WorkflowCoordinatorAgent = Agent(
    model=MODEL,
    name="workflow_coordinator",
    description=(
        "Điều phối viên quy trình số giúp thực thi workflow chuẩn hóa, gọi các Ban/Đơn vị liên quan "
        "và ghi nhận lịch sử để trình lãnh đạo phê duyệt"
    ),
    instruction=workflow_coordinator_prompt.PROMPT,
    tools=WORKFLOW_FUNCTION_TOOLS + WORKFLOW_TOOLS,
    sub_agents=[],
    output_key="workflow:coordinator_summary",
)


def attach_workflow_tool_to_executives():
    """Ensure executive agents có thể gọi điều phối workflow."""
    registry = get_agent_registry()
    workflow_tool = AgentTool(agent=WorkflowCoordinatorAgent)
    target_agents = [
        "do_chi_thanh",
        "duong_manh_son",
        "le_xuan_huyen",
        "phan_tu_giang",
        "le_manh_cuong",
        "le_ngoc_son",
    ]
    for name in target_agents:
        agent = registry.get(name)
        if not agent:
            continue
        existing = getattr(agent, "tools", [])
        if all(getattr(tool, "agent", None) is not WorkflowCoordinatorAgent for tool in existing):
            existing.append(workflow_tool)
            agent.tools = existing


attach_workflow_tool_to_executives()

__all__ = ["WorkflowCoordinatorAgent"]
