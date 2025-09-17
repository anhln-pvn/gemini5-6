"""Workflow management tools for PVN Digital Twin."""

from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from google.adk.tools.tool_context import ToolContext

WORKFLOW_DIR = Path(__file__).resolve().parent.parent / "workflows"


def _timestamp() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


def load_workflow_plan(
    workflow_id: str,
    lead_agent: Optional[str] = None,
    escalation_target: Optional[str] = None,
    tool_context: ToolContext | None = None,
) -> Dict[str, Any]:
    """Load a workflow template and persist it to session state.

    Args:
        workflow_id: Identifier of the workflow JSON file (without extension).
        lead_agent: Optional override for the responsible agent of step 1.
        escalation_target: Optional override for the escalation agent.
        tool_context: Execution context provided by ADK.
    """
    if tool_context is None:
        raise ValueError("ToolContext is required to load workflow plan")

    workflow_path = WORKFLOW_DIR / f"{workflow_id}.json"
    if not workflow_path.exists():
        raise FileNotFoundError(f"Workflow template not found: {workflow_path}")

    with workflow_path.open("r", encoding="utf-8") as f:
        plan = json.load(f)

    current_doc = tool_context.state.get("current_document")
    if current_doc:
        plan["doc_id"] = current_doc

    if lead_agent:
        plan["lead_agent"] = lead_agent

    if escalation_target:
        plan.setdefault("escalation", {})["target_agent"] = escalation_target

    plan.setdefault("metadata", {})["loaded_at"] = _timestamp()
    plan["metadata"]["loaded_by"] = tool_context.agent_name

    tool_context.state["workflow:plan"] = plan
    tool_context.state["workflow:history"] = []
    tool_context.state.pop("workflow:summary", None)

    return {
        "status": "loaded",
        "workflow_id": workflow_id,
        "doc_id": plan.get("doc_id"),
        "lead_agent": lead_agent or plan.get("lead_agent"),
    }


def log_workflow_event(
    step_id: str,
    status: str,
    note: str,
    tool_context: ToolContext | None = None,
) -> Dict[str, Any]:
    """Append an event to the workflow history for analytics."""
    if tool_context is None:
        raise ValueError("ToolContext is required")

    history: List[Dict[str, Any]] = tool_context.state.setdefault("workflow:history", [])
    entry = {
        "timestamp": _timestamp(),
        "actor": tool_context.agent_name,
        "step_id": step_id,
        "status": status,
        "note": note,
    }
    history.append(entry)
    tool_context.state["workflow:history"] = history
    return entry


def finalize_workflow_summary(
    summary: str,
    next_actions: str,
    metrics: Optional[Dict[str, Any]] = None,
    tool_context: ToolContext | None = None,
) -> Dict[str, Any]:
    """Persist the workflow summary for downstream escalation."""
    if tool_context is None:
        raise ValueError("ToolContext is required")

    payload = {
        "summary": summary,
        "next_actions": next_actions,
        "metrics": metrics or {},
        "finalized_at": _timestamp(),
        "finalized_by": tool_context.agent_name,
    }
    tool_context.state["workflow:summary"] = payload
    return payload


__all__ = [
    "load_workflow_plan",
    "log_workflow_event",
    "finalize_workflow_summary",
]
