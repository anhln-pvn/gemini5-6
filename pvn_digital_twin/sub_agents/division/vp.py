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

"""VP Agent for document routing and metadata generation."""

from google.adk.agents import Agent

from ... import MODEL
from . import vp_prompt
from ...tools.document_tools import (
    extract_document_metadata,
    analyze_document_content,
    suggest_routing,
)
from ..executive.ceo import CEOAgent
from ..executive.dcthanh import DoChiThanhAgent
from ..executive.dmson import DuongManhSonAgent
from ..executive.lxhuyen import LeXuanHuyenAgent
from ..executive.ptgiang import PhanTuGiangAgent
from ..executive.lmcuong import LeManhCuongAgent


VPAgent = Agent(
    model=MODEL,
    name="VP",
    description="Văn phòng PVN - tiếp nhận văn bản đến, tạo metadata và chuyển tiếp tới Lãnh đạo phù hợp",
    instruction=vp_prompt.PROMPT,
    tools=[
        extract_document_metadata,
        analyze_document_content,
        suggest_routing,
    ],
    sub_agents=[
        CEOAgent,
        DoChiThanhAgent,
        DuongManhSonAgent,
        LeXuanHuyenAgent,
        PhanTuGiangAgent,
        LeManhCuongAgent,
    ],
    output_key="vp_instruction"
)
