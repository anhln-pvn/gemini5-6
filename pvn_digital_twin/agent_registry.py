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

"""Central agent registry for PVN Digital Twin system."""

def get_agent_registry():
    """Get the agent registry with lazy imports to avoid circular dependencies."""
    # Import all agents lazily to avoid circular imports
    from .sub_agents.division.vp import VPAgent
    from .sub_agents.executive.ceo import CEOAgent
    from .sub_agents.executive.dcthanh import DoChiThanhAgent
    from .sub_agents.executive.dmson import DuongManhSonAgent
    from .sub_agents.executive.lxhuyen import LeXuanHuyenAgent
    from .sub_agents.executive.ptgiang import PhanTuGiangAgent
    from .sub_agents.executive.lmcuong import LeManhCuongAgent

    # Division agents
    from .sub_agents.division.qtnnl import QTNNLAgent
    from .sub_agents.division.ktdt import KTĐTAgent
    from .sub_agents.division.qtrr import QTRRAgent
    from .sub_agents.division.tdkt import TDKTAgent
    from .sub_agents.division.tkdk import TKDKAgent
    from .sub_agents.division.cnklhd import CNKLHDAgent
    from .sub_agents.division.dnltt import DNLTTAgent
    from .sub_agents.division.khcncds import KHCNCDSAgent
    from .sub_agents.division.atmt import ATMTAgent
    from .sub_agents.division.tmdv import TMDVAgent
    from .sub_agents.division.tckt import TCKTAgent
    from .sub_agents.division.pcdt import PCĐTAgent
    from .sub_agents.division.ttvhdn import TTVHDNAgent
    from .sub_agents.division.qlhd import QLHDAgent
    from .sub_agents.division.cl import CLAgent
    from .sub_agents.division.knsb import KNSBAgent
    from .sub_agents.division.th import THAgent

    # Board agents
    from .sub_agents.board.lmhung import LeManhHungAgent
    from .sub_agents.board.lnson import LeNgocSonAgent
    from .sub_agents.board.bmtien import BuiMinhTienAgent
    from .sub_agents.board.nvmau import NguyenVanMauAgent
    from .sub_agents.board.tbminh import TranBinhMinhAgent
    from .sub_agents.board.ptanh import PhamTuanAnhAgent
    from .sub_agents.board.thnam import TranHongNamAgent

    # Central registry of all agents
    return {
        # Core agents
        "vp": VPAgent,
        "ceo": CEOAgent,
        
        # VP agents
        "dcthanh": DoChiThanhAgent,
        "dmson": DuongManhSonAgent,
        "lxhuyen": LeXuanHuyenAgent,
        "ptgiang": PhanTuGiangAgent,
        "lmcuong": LeManhCuongAgent,
        
        # Division agents
        "qtnnl": QTNNLAgent,
        "ktdt": KTĐTAgent,
        "qtrr": QTRRAgent,
        "tdkt": TDKTAgent,
        "tkdk": TKDKAgent,
        "cnklhd": CNKLHDAgent,
        "dnltt": DNLTTAgent,
        "khcncds": KHCNCDSAgent,
        "atmt": ATMTAgent,
        "tmdv": TMDVAgent,
        "tckt": TCKTAgent,
        "pcdt": PCĐTAgent,
        "ttvhdn": TTVHDNAgent,
        "qlhd": QLHDAgent,
        "cl": CLAgent,
        "knsb": KNSBAgent,
        "th": THAgent,
        
        # Board agents
        "lmhung": LeManhHungAgent,
        "lnson": LeNgocSonAgent,
        "bmtien": BuiMinhTienAgent,
        "nvmau": NguyenVanMauAgent,
        "tbminh": TranBinhMinhAgent,
        "ptanh": PhamTuanAnhAgent,
        "thnam": TranHongNamAgent,
    }

# Agent categories for easy access
EXECUTIVE_AGENTS = ["ceo", "dcthanh", "dmson", "lxhuyen", "ptgiang", "lmcuong"]
DIVISION_AGENTS = ["qtnnl", "ktdt", "qtrr", "tdkt", "tkdk", "cnklhd", "dnltt", "khcncds", "atmt", "tmdv", "tckt", "pcdt", "ttvhdn", "qlhd", "cl", "knsb", "th"]
BOARD_AGENTS = ["lmhung", "lnson", "bmtien", "nvmau", "tbminh", "ptanh", "thnam"]
