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

"""Document processing tools for PVN Digital Twin."""

from collections import Counter
import re
import uuid
from datetime import datetime
from typing import Dict, Any, List

from google.adk.tools.tool_context import ToolContext

def extract_document_metadata(
    title: str,
    content: str,
    document_type: str = "Công văn",
    counterpart_organization: str = "",
    document_number: str = "",
    symbol_code: str = "",
    document_date: str = "",
    received_date: str = "",
    sent_date: str = "",
    direction: str = "incoming",
    tool_context: ToolContext = None
) -> Dict[str, Any]:
    """
    Trích xuất và tạo metadata cho văn bản PVN.

    Args:
        title: Tiêu đề văn bản
        content: Nội dung văn bản để tạo trích yếu
        document_type: Loại văn bản (Công văn, Quyết định, Thông báo...)
        counterpart_organization: Tổ chức gửi/nhận văn bản
        document_number: Số văn bản
        symbol_code: Ký hiệu văn bản
        document_date: Ngày trên văn bản
        received_date: Ngày đến (nếu là văn bản đến)
        sent_date: Ngày gửi đi (nếu là văn bản đi)
        direction: Loại văn bản (incoming/outgoing/internal)

    Returns:
        Dictionary chứa metadata của văn bản
    """
    # Generate unique ID
    doc_id = str(uuid.uuid4())[:8]

    # Generate summary from first 200 characters of content
    summary = content[:200] + "..." if len(content) > 200 else content
    summary = summary.replace("\n", " ").strip()

    # Set current date if dates not provided
    current_date = datetime.now().strftime("%Y-%m-%d")

    metadata = {
        "id": doc_id,
        "title": title,
        "summary": summary,
        "direction": direction,
        "counterpartOrganisation": counterpart_organization,
        "documentNumber": document_number,
        "symbolCode": symbol_code if symbol_code else None,
        "documentDate": document_date if document_date else None,
        "receivedDate": received_date if received_date and direction == "incoming" else None,
        "sentDate": sent_date if sent_date and direction == "outgoing" else None,
        "documentType": document_type,
        "processedDate": current_date,
        "processedBy": tool_context.agent_name if tool_context else "unknown"
    }

    # Store metadata in session state for other agents to access
    if tool_context:
        tool_context.state[f"document:{doc_id}"] = metadata
        tool_context.state["doc-metadata"] = metadata
        tool_context.state["current_document"] = doc_id
        tool_context.state["last_processed_document"] = doc_id
        
        # Track document processing pipeline
        processing_history = tool_context.state.get("document_processing_history", [])
        processing_history.append({
            "doc_id": doc_id,
            "timestamp": current_date,
            "agent": tool_context.agent_name,
            "status": "metadata_extracted"
        })
        tool_context.state["document_processing_history"] = processing_history

    return metadata


def analyze_document_content(
    content: str,
    tool_context: ToolContext = None,
) -> Dict[str, Any]:
    """Basic heuristic analysis for a PVN document.

    The analysis is intentionally lightweight. It extracts keywords,
    detects urgency hints, and identifies thematic buckets that will be
    useful for routing suggestions further down the pipeline.
    """

    lowered = content.lower()
    tokens = [tok for tok in re.split(r"[\s/&,;:()\-]+", lowered) if tok]
    keywords = [w for w in tokens if len(w) > 4]

    urgency_markers = {
        "khẩn": "urgent",
        "gấp": "urgent",
        "khẩn cấp": "urgent",
        "ngay": "urgent",
        "ngay lập tức": "urgent",
        "trước": "deadline",
        "hạn": "deadline",
    }

    detected_flags: List[str] = []
    for marker, flag in urgency_markers.items():
        if marker in lowered and flag not in detected_flags:
            detected_flags.append(flag)

    normalized_text = lowered.replace("&", " ").replace("/", " ").replace("-", " ")

    themes = {
        "thăm dò": "exploration",
        "khoan": "exploration",
        "đầu tư": "investment",
        "tài chính": "finance",
        "khoa học": "science",
        "công nghệ": "science",
        "chuyển đổi số": "digital",
        "đổi mới": "innovation",
        "sáng tạo": "innovation",
        "khcn": "science",
        "đmst": "innovation",
        "an toàn": "safety",
        "môi trường": "safety",
        "điện": "power",
        "năng lượng": "power",
        "truyền thông": "communications",
        "pháp chế": "legal",
    }

    detected_themes: List[str] = []
    for token, theme in themes.items():
        haystack = normalized_text if " " in token else normalized_text
        if token in haystack and theme not in detected_themes:
            detected_themes.append(theme)

    # Token-based detection fallback for short forms (e.g., "khcn")
    for token in tokens:
        if token in {"khcn", "khcncds"} and "science" not in detected_themes:
            detected_themes.append("science")
        if token in {"đmst", "dmst"} and "innovation" not in detected_themes:
            detected_themes.append("innovation")

    analysis = {
        "word_count": len(tokens),
        "keywords": list(Counter(keywords).most_common(15)),
        "flags": detected_flags,
        "themes": detected_themes,
    }

    if tool_context:
        tool_context.state["document_analysis"] = analysis

    return analysis


def suggest_routing(
    metadata: Dict[str, Any],
    analysis: Dict[str, Any],
    tool_context: ToolContext = None,
) -> Dict[str, Any]:
    """Suggest the executive and division best suited for the document."""

    summary = f"{metadata.get('title', '')} {metadata.get('summary', '')}".lower()
    themes = set(analysis.get("themes", []))

    suggestions = {
        "executive": "le_ngoc_son",
        "division": None,
        "confidence": "medium",
        "rationale": [],
    }

    def set_target(executive: str, division: str, reason: str, confidence: str = "high"):
        suggestions["executive"] = executive
        suggestions["division"] = division
        suggestions["confidence"] = confidence
        suggestions["rationale"].append(reason)

    if "exploration" in themes or "khoan" in summary:
        set_target("le_manh_cuong", "tdkt", "Liên quan thăm dò khai thác", "high")
    elif "investment" in themes or "đầu tư" in summary:
        set_target("duong_manh_son", "ktdt", "Nội dung về kinh tế đầu tư", "high")
    elif "finance" in themes or "tài chính" in summary:
        set_target("duong_manh_son", "tckt", "Nội dung tài chính kế toán", "high")
    elif any(theme in themes for theme in {"science", "digital", "innovation"}) or "khoa học" in summary:
        set_target("le_xuan_huyen", "khcncds", "Liên quan khoa học công nghệ & chuyển đổi số")
    elif "power" in themes or "điện" in summary or "năng lượng" in summary:
        set_target("phan_tu_giang", "dnltt", "Nội dung về điện và năng lượng tái tạo")
    elif "legal" in themes or "pháp chế" in summary:
        set_target("do_chi_thanh", "pcdt", "Vấn đề pháp chế, đấu thầu")
    elif "communications" in themes or "truyền thông" in summary:
        set_target("do_chi_thanh", "ttvhdn", "Truyền thông và văn hóa doanh nghiệp")
    elif "safety" in themes or "an toàn" in summary or "môi trường" in summary:
        set_target("phan_tu_giang", "atmt", "An toàn môi trường, phát triển bền vững")
    else:
        suggestions["rationale"].append("Không nhận diện rõ, giữ mặc định CEO")

    if tool_context:
        tool_context.state["routing_suggestion"] = suggestions

    return suggestions


__all__ = [
    "extract_document_metadata",
    "analyze_document_content",
    "suggest_routing",
]
