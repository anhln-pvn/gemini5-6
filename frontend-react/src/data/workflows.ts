export interface WorkflowOutputMetric {
  name: string;
  description: string;
}

export interface WorkflowArtifact {
  key: string;
  description: string;
}

export interface WorkflowMilestone {
  name: string;
  due: string;
}

export interface WorkflowTimelineMeta {
  start: string;
  expected_completion: string;
  milestones: WorkflowMilestone[];
}

export interface WorkflowEscalation {
  target_agent: string;
  trigger: string;
  deliverable_key: string;
}

export interface WorkflowStep {
  id: string;
  role: 'Responsible' | 'Accountable' | 'Consulted' | 'Informed' | string;
  mode: 'agent_tool' | 'parallel' | string;
  agents: string[];
  inputs: string[];
  outputs: string[];
  instructions: string[];
  deadline?: string;
  dependencies: string[];
}

export interface WorkflowPhase {
  id: string;
  name: string;
  summary: string;
  steps: WorkflowStep[];
}

export interface Workflow {
  id: string;
  title: string;
  summary: string;
  phases: WorkflowPhase[];
  artifacts?: WorkflowArtifact[];
  metrics?: WorkflowOutputMetric[];
  timeline?: WorkflowTimelineMeta;
  escalation?: WorkflowEscalation;
}

export const WORKFLOWS: Workflow[] = [
  {
    id: 'mua-sam-dich-vu-truyen-thong',
    title: 'Quy trình mua sắm dịch vụ truyền thông bảo đảm hoạt động thường xuyên',
    summary:
      'Quy trình chuẩn nhằm tiếp nhận nhu cầu, lập kế hoạch, thẩm định và lựa chọn nhà cung cấp dịch vụ truyền thông phục vụ hoạt động thường xuyên của PVN, bảo đảm tuân thủ Quyết định 4281/QĐ-DKVN và các quy định đấu thầu hiện hành.',
    phases: [
      {
        id: 'phase1_khoi_dong',
        name: 'Khởi động và lập phạm vi',
        summary: 'Ban đầu mối tiếp nhận nhu cầu, xác lập phạm vi, dự toán và nguồn vốn cho gói mua sắm.',
        steps: [
          {
            id: 'step01_responsible_tmdv',
            role: 'Responsible',
            mode: 'agent_tool',
            agents: ['tmdv'],
            inputs: ['doc-metadata', 'routing_suggestion'],
            outputs: ['workflow:proposal:tmdv'],
            instructions: [
              'Rà soát nhu cầu mua sắm dựa trên văn bản và các quy định tại Quyết định 4281/QĐ-DKVN',
              'Lập dự thảo phạm vi công việc, danh mục dịch vụ truyền thông, thời gian và địa điểm thực hiện',
              'Xác định sơ bộ nguồn vốn, ước tính chi phí và mốc thời gian chính (giả định nếu chưa đủ dữ liệu)',
              'Ghi nhận các rủi ro về tiến độ, thương hiệu và tuân thủ cần xử lý',
            ],
            deadline: '+3d',
            dependencies: [],
          },
          {
            id: 'step02_consulted_parallel',
            role: 'Consulted',
            mode: 'parallel',
            agents: ['tckt', 'pcdt'],
            inputs: ['doc-metadata', 'workflow:proposal:tmdv'],
            outputs: ['workflow:consult:tckt', 'workflow:consult:pcdt'],
            instructions: [
              'Ban TCKT thẩm tra dự toán, nguồn vốn và tính khả thi tài chính',
              'Ban PCĐT rà soát pháp lý, thủ tục đấu thầu, đề xuất hình thức lựa chọn nhà cung cấp và yêu cầu bảo mật',
              'Nếu thiếu dữ liệu, nêu rõ giả định hoặc đề xuất bổ sung hồ sơ',
            ],
            deadline: '+5d',
            dependencies: ['step01_responsible_tmdv'],
          },
          {
            id: 'step03_accountable_do_chi_thanh',
            role: 'Accountable',
            mode: 'agent_tool',
            agents: ['do_chi_thanh'],
            inputs: [
              'doc-metadata',
              'workflow:proposal:tmdv',
              'workflow:consult:tckt',
              'workflow:consult:pcdt',
            ],
            outputs: ['workflow:approval:do_chi_thanh'],
            instructions: [
              'Tổng hợp kết quả tham vấn, ra chỉ đạo bổ sung hoặc chấp thuận phạm vi, dự toán và kế hoạch mua sắm',
              'Xác định yêu cầu về tiến độ, phân công Bộ phận mua sắm và tiêu chí giám sát',
              'Nếu cần, yêu cầu cập nhật hồ sơ trước khi chuyển sang bước lựa chọn nhà cung cấp',
            ],
            deadline: '+7d',
            dependencies: ['step02_consulted_parallel'],
          },
        ],
      },
      {
        id: 'phase2_to_chuc_lua_chon',
        name: 'Tổ chức lựa chọn nhà cung cấp',
        summary:
          'Bộ phận mua sắm phối hợp các ban liên quan phát hành hồ sơ, đánh giá và đề xuất đơn vị trúng thầu.',
        steps: [
          {
            id: 'step04_responsible_vp_procurement',
            role: 'Responsible',
            mode: 'agent_tool',
            agents: ['vp'],
            inputs: ['doc-metadata', 'workflow:approval:do_chi_thanh'],
            outputs: ['workflow:proposal:vp'],
            instructions: [
              'Thành lập Bộ phận mua sắm, lập hồ sơ mời thầu/yêu cầu báo giá phù hợp với phạm vi đã phê duyệt',
              'Công bố kế hoạch mời thầu và thời hạn nhận hồ sơ, đảm bảo tối thiểu các mốc theo Quyết định 4281/QĐ-DKVN',
              'Ghi nhận tiêu chí đánh giá và kế hoạch truyền thông nội bộ về gói thầu',
            ],
            deadline: '+9d',
            dependencies: ['step03_accountable_do_chi_thanh'],
          },
          {
            id: 'step05_consulted_parallel',
            role: 'Consulted',
            mode: 'parallel',
            agents: ['ttvhdn', 'qtrr'],
            inputs: ['doc-metadata', 'workflow:proposal:vp'],
            outputs: ['workflow:consult:ttvhdn', 'workflow:consult:qtrr'],
            instructions: [
              'Ban TT&VHDN đánh giá yêu cầu truyền thông, tiêu chí nội dung và quản trị thương hiệu',
              'Ban QTRR rà soát rủi ro tuân thủ, bảo mật và đề xuất biện pháp kiểm soát',
              'Báo cáo các phát hiện cần lãnh đạo xem xét',
            ],
            deadline: '+11d',
            dependencies: ['step04_responsible_vp_procurement'],
          },
          {
            id: 'step06_consulted_all_divisions',
            role: 'Consulted',
            mode: 'parallel',
            agents: [
              'qtnnl',
              'ktdt',
              'tdkt',
              'tkdk',
              'cnklhd',
              'dnltt',
              'khcncds',
              'atmt',
              'tmdv',
              'tckt',
              'pcdt',
              'qlhd',
              'cl',
              'knsb',
              'th',
            ],
            inputs: [
              'doc-metadata',
              'workflow:proposal:vp',
              'workflow:consult:ttvhdn',
              'workflow:consult:qtrr',
            ],
            outputs: [
              'workflow:consult:qtnnl',
              'workflow:consult:ktdt',
              'workflow:consult:tdkt',
              'workflow:consult:tkdk',
              'workflow:consult:cnklhd',
              'workflow:consult:dnltt',
              'workflow:consult:khcncds',
              'workflow:consult:atmt',
              'workflow:consult:tmdv',
              'workflow:consult:tckt',
              'workflow:consult:pcdt',
              'workflow:consult:qlhd',
              'workflow:consult:cl',
              'workflow:consult:knsb',
              'workflow:consult:th',
            ],
            instructions: [
              'Từng Ban rà soát phạm vi mua sắm theo chức năng được phân công',
              'Nếu nội dung không liên quan, phản hồi "Không có ý kiến" và nêu lý do',
              'Đề xuất nguồn lực, rủi ro, phối hợp cần thiết (nếu có)',
              'Cập nhật kết quả vào khóa `workflow:consult:<mã_ban>` tương ứng',
            ],
            deadline: '+11d',
            dependencies: ['step05_consulted_parallel'],
          },
          {
            id: 'step07_responsible_tmdv_eval',
            role: 'Responsible',
            mode: 'agent_tool',
            agents: ['tmdv'],
            inputs: [
              'workflow:proposal:vp',
              'workflow:consult:tmdv',
              'workflow:consult:tckt',
              'workflow:consult:pcdt',
              'workflow:consult:qtrr',
            ],
            outputs: ['workflow:evaluation:tmdv'],
            instructions: [
              'Tập hợp kết quả chấm điểm, lập bảng xếp hạng nhà cung cấp và đề xuất trúng thầu',
              'Nêu rõ các tiêu chí đánh giá định lượng/định tính và khuyến nghị đàm phán',
              'Đề xuất kế hoạch thương thảo, thời gian ký kết hợp đồng và nguồn lực triển khai',
            ],
            deadline: '+12d',
            dependencies: ['step06_consulted_all_divisions'],
          },
          {
            id: 'step08_accountable_do_chi_thanh_award',
            role: 'Accountable',
            mode: 'agent_tool',
            agents: ['do_chi_thanh'],
            inputs: [
              'workflow:evaluation:tmdv',
              'workflow:consult:ttvhdn',
              'workflow:consult:qtrr',
              'workflow:consult:tckt',
              'workflow:consult:pcdt',
            ],
            outputs: ['workflow:approval:award'],
            instructions: [
              'Xem xét kết quả đánh giá, ra quyết định phê duyệt nhà cung cấp trúng thầu',
              'Chỉ đạo Bộ phận mua sắm hoàn thiện dự thảo hợp đồng, thương thảo điều kiện thanh toán và cam kết chất lượng',
              'Xác định yêu cầu báo cáo tiến độ và cơ chế giám sát',
            ],
            deadline: '+13d',
            dependencies: ['step07_responsible_tmdv_eval'],
          },
          {
            id: 'step09_responsible_vp_contract',
            role: 'Responsible',
            mode: 'agent_tool',
            agents: ['vp'],
            inputs: ['workflow:approval:award', 'workflow:evaluation:tmdv'],
            outputs: ['workflow:contract_status'],
            instructions: [
              'Tổ chức thương thảo chi tiết với nhà cung cấp, hoàn thiện và ký kết hợp đồng',
              'Thiết lập kế hoạch bàn giao, nghiệm thu, lưu trữ hồ sơ theo yêu cầu bảo mật',
              'Cập nhật lịch trình báo cáo và đầu mối phối hợp triển khai',
            ],
            deadline: '+14d',
            dependencies: ['step08_accountable_do_chi_thanh_award'],
          },
          {
            id: 'step10_informed_th',
            role: 'Informed',
            mode: 'agent_tool',
            agents: ['th'],
            inputs: ['workflow:contract_status', 'workflow:approval:award'],
            outputs: ['workflow:notify:th'],
            instructions: [
              'Tổng hợp toàn bộ kết quả, lập báo cáo tóm tắt để thông tin đến lãnh đạo',
              'Ghi nhận dữ liệu phục vụ phân tích hiệu quả và cập nhật cơ sở tri thức',
              'Chuẩn bị nội dung truyền thông nội bộ sau khi hợp đồng được triển khai',
            ],
            deadline: '+15d',
            dependencies: ['step09_responsible_vp_contract'],
          },
        ],
      },
    ],
    artifacts: [
      {
        key: 'workflow:proposal:tmdv',
        description: 'Phạm vi và dự toán gói mua sắm do Ban TMDV lập',
      },
      {
        key: 'workflow:consult:tckt',
        description: 'Ý kiến thẩm tra tài chính của Ban TCKT',
      },
      {
        key: 'workflow:consult:pcdt',
        description: 'Ý kiến pháp chế và đấu thầu của Ban PCĐT',
      },
      {
        key: 'workflow:evaluation:tmdv',
        description: 'Báo cáo đánh giá và xếp hạng nhà cung cấp',
      },
      {
        key: 'workflow:approval:award',
        description: 'Quyết định phê duyệt kết quả lựa chọn nhà cung cấp',
      },
      {
        key: 'workflow:contract_status',
        description: 'Tình trạng hoàn thiện, ký kết hợp đồng',
      },
      {
        key: 'workflow:summary',
        description: 'Báo cáo tổng hợp gửi lãnh đạo phụ trách',
      },
    ],
    metrics: [
      {
        name: 'cycle_time',
        description: 'Thời gian thực hiện toàn bộ quy trình từ tiếp nhận đến ký hợp đồng',
      },
      {
        name: 'num_consultations',
        description: 'Số lượng ý kiến tư vấn/consulta thu thập được',
      },
    ],
    timeline: {
      start: 'auto',
      expected_completion: '+15d',
      milestones: [
        {
          name: 'Hoàn tất kế hoạch mua sắm',
          due: '+5d',
        },
        {
          name: 'Thẩm định và phê duyệt',
          due: '+10d',
        },
      ],
    },
    escalation: {
      target_agent: 'do_chi_thanh',
      trigger:
        'Trình lãnh đạo phụ trách nội chính phê duyệt khi kế hoạch và báo cáo tổng hợp đã hoàn thiện',
      deliverable_key: 'workflow:summary',
    },
  },
];
