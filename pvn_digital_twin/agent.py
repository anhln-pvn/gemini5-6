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

"""PVN Digital Twin multi-agent system."""

import logging
import warnings

from google.adk.agents import Agent

from . import MODEL, root_agent_prompt
from .sub_agents.division.vp import VPAgent

warnings.filterwarnings("ignore", category=UserWarning, module=".*pydantic.*")

logger = logging.getLogger(__name__)
logger.debug("Using MODEL: %s", MODEL)

# Root agent - PVN Digital Twin with strict VP-first delegation
root_agent = Agent(
    model=MODEL,
    name="pvn_digital_twin",
    description=(
        "Bản sao số quản trị Digital Twin Organisation cho Tập đoàn Công nghiệp - Năng lượng Quốc gia Việt Nam. "
        "Trả lời các câu hỏi đáp nói chung một cách trang trọng, chuẩn xác, và bắt đầu xử lý công việc bằng việc chuyển tiếp qua các agent phù hợp"
    ),
    instruction=root_agent_prompt.PROMPT,
    tools=[],
    sub_agents=[VPAgent],
    output_key="pvn_response"
)
