import { FACTORY } from './config';
import { EntityInfo, TooltipData } from './entities';

// ─── Worker Definition ─────────────────────────────────────────

export interface WorkerDef {
  id: string;
  /** Building this worker belongs to */
  buildingId: string;
  /** Display name */
  name: string;
  /** Role / RTL signal or SW variable represented */
  role: string;
  /** Worker appearance color */
  color: number;
  /** Hat color */
  hatColor: number;
  /** Tiny icon shown above worker */
  badge: string;
  /** Offset within building (from building top-left) */
  offsetX: number;
  offsetY: number;
  /** Patrol radius (0 = stationary) */
  patrol: number;
}

// ─── Worker Data ───────────────────────────────────────────────

export const WORKERS: WorkerDef[] = [

  // ── 관제탑 (FSM) 작업자들 ──
  {
    id: 'fsm_state_reg', buildingId: 'fsm',
    name: '관제탑 수석', role: 'state[2:0]',
    color: 0x3498db, hatColor: 0x2980b9, badge: '🚦',
    offsetX: 50, offsetY: 90, patrol: 30,
  },
  {
    id: 'fsm_bank_sel', buildingId: 'fsm',
    name: 'A/B조 교대원', role: 'bank_sel',
    color: 0x9b59b6, hatColor: 0x8e44ad, badge: '🔄',
    offsetX: 150, offsetY: 100, patrol: 20,
  },
  {
    id: 'fsm_exec_cnt', buildingId: 'fsm',
    name: '생산 카운터', role: 'exec_cnt[15:0]',
    color: 0x2ecc71, hatColor: 0x27ae60, badge: '🔢',
    offsetX: 260, offsetY: 90, patrol: 25,
  },

  // ── 하역장 (DMA) 작업자들 ──
  {
    id: 'dma_req_cnt', buildingId: 'dma',
    name: '하역 발주원', role: 'req_cnt[15:0]',
    color: 0xe67e22, hatColor: 0xd35400, badge: '📤',
    offsetX: 60, offsetY: 90, patrol: 35,
  },
  {
    id: 'dma_resp_cnt', buildingId: 'dma',
    name: '하역 입고원', role: 'resp_cnt[15:0]',
    color: 0xe67e22, hatColor: 0xd35400, badge: '📥',
    offsetX: 160, offsetY: 100, patrol: 30,
  },
  {
    id: 'dma_outstanding', buildingId: 'dma',
    name: '하역 교통정리원', role: 'outstanding_cnt[7:0]',
    color: 0xf39c12, hatColor: 0xe67e22, badge: '📊',
    offsetX: 230, offsetY: 85, patrol: 20,
  },

  // ── 냉장고 Bank 0 작업자 ──
  {
    id: 'sram0_write_port', buildingId: 'sram0',
    name: '입고 담당 (Port A)', role: 'wen_a / wdata_a',
    color: 0x2ecc71, hatColor: 0x27ae60, badge: '✍️',
    offsetX: 40, offsetY: 100, patrol: 25,
  },
  {
    id: 'sram0_read_port', buildingId: 'sram0',
    name: '출고 담당 (Port B)', role: 'ren_b / rdata_b',
    color: 0x3498db, hatColor: 0x2980b9, badge: '📖',
    offsetX: 140, offsetY: 110, patrol: 25,
  },

  // ── 냉장고 Bank 1 작업자 ──
  {
    id: 'sram1_write_port', buildingId: 'sram1',
    name: '입고 담당 (Port A)', role: 'wen_a / wdata_a',
    color: 0x2ecc71, hatColor: 0x27ae60, badge: '✍️',
    offsetX: 40, offsetY: 100, patrol: 25,
  },
  {
    id: 'sram1_read_port', buildingId: 'sram1',
    name: '출고 담당 (Port B)', role: 'ren_b / rdata_b',
    color: 0x3498db, hatColor: 0x2980b9, badge: '📖',
    offsetX: 140, offsetY: 110, patrol: 25,
  },

  // ── 냉장고 Bank 2 작업자 ──
  {
    id: 'sram2_write_port', buildingId: 'sram2',
    name: '입고 담당 (Port A)', role: 'wen_a / wdata_a',
    color: 0x2ecc71, hatColor: 0x27ae60, badge: '✍️',
    offsetX: 40, offsetY: 100, patrol: 25,
  },
  {
    id: 'sram2_read_port', buildingId: 'sram2',
    name: '출고 담당 (Port B)', role: 'ren_b / rdata_b',
    color: 0x3498db, hatColor: 0x2980b9, badge: '📖',
    offsetX: 140, offsetY: 110, patrol: 25,
  },

  // ── 냉장고 Bank 3 작업자 ──
  {
    id: 'sram3_write_port', buildingId: 'sram3',
    name: '입고 담당 (Port A)', role: 'wen_a / wdata_a',
    color: 0x2ecc71, hatColor: 0x27ae60, badge: '✍️',
    offsetX: 40, offsetY: 100, patrol: 25,
  },
  {
    id: 'sram3_read_port', buildingId: 'sram3',
    name: '출고 담당 (Port B)', role: 'ren_b / rdata_b',
    color: 0x3498db, hatColor: 0x2980b9, badge: '📖',
    offsetX: 140, offsetY: 110, patrol: 25,
  },

  // ── 전처리대 작업자들 ──
  {
    id: 'skew_operator', buildingId: 'conveyor',
    name: '전처리 정렬공 (Skew)', role: 'delay_pipe[row][i]',
    color: 0x1abc9c, hatColor: 0x16a085, badge: '↗️',
    offsetX: 120, offsetY: 35, patrol: 60,
  },
  {
    id: 'deskew_operator', buildingId: 'conveyor',
    name: '후처리 정렬공 (Deskew)', role: 'deskew_delay[col][j]',
    color: 0x1abc9c, hatColor: 0x16a085, badge: '↘️',
    offsetX: 600, offsetY: 35, patrol: 60,
  },

  // ── 오븐 (PE Grid) 작업자들 ──
  {
    id: 'pe_weight_loader', buildingId: 'pe_grid',
    name: '양념 장전공', role: 'wt_load_shift[15:0]',
    color: 0xf39c12, hatColor: 0xe67e22, badge: '🔧',
    offsetX: 30, offsetY: 100, patrol: 40,
  },
  {
    id: 'pe_act_feeder', buildingId: 'pe_grid',
    name: '재료 투입공', role: 'act_in_left[15:0]',
    color: 0xe74c3c, hatColor: 0xc0392b, badge: '📦',
    offsetX: 30, offsetY: 380, patrol: 40,
  },
  {
    id: 'pe_psum_collector', buildingId: 'pe_grid',
    name: '반조리품 수거공', role: 'psum_bottom[15:0]',
    color: 0x3498db, hatColor: 0x2980b9, badge: '🧺',
    offsetX: 350, offsetY: 620, patrol: 50,
  },

  // ── 결과 보관소 (Accumulator) 작업자들 ──
  {
    id: 'acc_writer', buildingId: 'accum',
    name: '적재공', role: 'acc_valid / acc_addr',
    color: 0x8e44ad, hatColor: 0x7d3c98, badge: '📝',
    offsetX: 80, offsetY: 80, patrol: 40,
  },
  {
    id: 'acc_forwarder', buildingId: 'accum',
    name: 'RAW 해결사', role: 'forward_en',
    color: 0xe74c3c, hatColor: 0xc0392b, badge: '⚡',
    offsetX: 250, offsetY: 90, patrol: 30,
  },
  {
    id: 'acc_drainer', buildingId: 'accum',
    name: '출하 담당', role: 'drain_re / drain_addr',
    color: 0x1abc9c, hatColor: 0x16a085, badge: '🚚',
    offsetX: 450, offsetY: 80, patrol: 35,
  },

  // ── 품질검사동 작업자들 ──
  {
    id: 'verify_golden', buildingId: 'core_replay',
    name: '레시피 비교원', role: 'GoldenEntry[]',
    color: 0x5dade2, hatColor: 0x3498db, badge: '✅',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'verify_axi_model', buildingId: 'system_replay',
    name: '물류 모형 관리원', role: 'AxiMemoryModel',
    color: 0x5dade2, hatColor: 0x3498db, badge: '🔌',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'verify_uvm_seq', buildingId: 'uvm',
    name: '무작위 주문 발생기', role: 'npu_seq_item',
    color: 0xf39c12, hatColor: 0xe67e22, badge: '🎲',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'verify_coverage', buildingId: 'signoff',
    name: '합격률 측정원', role: 'covergroup',
    color: 0x2ecc71, hatColor: 0x27ae60, badge: '📈',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'verify_ci_runner', buildingId: 'ci',
    name: '자동 품질검사원', role: 'Makefile targets',
    color: 0x95a5a6, hatColor: 0x7f8c8d, badge: '🤖',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'verify_validator', buildingId: 'validator',
    name: '포장 검수원', role: 'validate_program()',
    color: 0x2ecc71, hatColor: 0x27ae60, badge: '🔍',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'verify_drift', buildingId: 'drift',
    name: '드리프트 감시원', role: 'test_asset_binary_stability()',
    color: 0xe74c3c, hatColor: 0xc0392b, badge: '📏',
    offsetX: 100, offsetY: 100, patrol: 30,
  },

  // ── 사무동 작업자들 ──
  {
    id: 'hq_compiler_worker', buildingId: 'compiler',
    name: '공장장', role: 'compile_program()',
    color: 0x5dade2, hatColor: 0x3498db, badge: '🏭',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'hq_tracer_worker', buildingId: 'tracer',
    name: '접수 담당', role: 'trace_torch_module()',
    color: 0x5dade2, hatColor: 0x3498db, badge: '📋',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'hq_ir_worker', buildingId: 'ir',
    name: '공정 분류공', role: 'lower_program_to_steps()',
    color: 0x5dade2, hatColor: 0x3498db, badge: '📐',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'hq_lowering_worker', buildingId: 'lowering',
    name: '절단 기사', role: 'plan_linear_tiles()',
    color: 0x5dade2, hatColor: 0x3498db, badge: '✂️',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'hq_scheduler_worker', buildingId: 'scheduler',
    name: '순서 최적화공', role: 'reorder_tiles()',
    color: 0x5dade2, hatColor: 0x3498db, badge: '📅',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'hq_emitter_worker', buildingId: 'emitter',
    name: '포장 기사', role: 'export_linear_tiled_package()',
    color: 0x5dade2, hatColor: 0x3498db, badge: '📦',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
  {
    id: 'hq_replay_bridge_worker', buildingId: 'replay_bridge',
    name: '배송 변환공', role: 'export_replay_packages()',
    color: 0x5dade2, hatColor: 0x3498db, badge: '🚚',
    offsetX: 100, offsetY: 100, patrol: 30,
  },
];

// ─── Worker EntityInfo ─────────────────────────────────────────

const WORKER_DETAIL: Record<string, EntityInfo> = {
  // FSM workers
  fsm_state_reg: {
    icon: '🚦', title: '관제탑 수석', subtitle: 'state[2:0] — npu_system_top.sv',
    category: '관제탑 · FSM 레지스터',
    stats: [
      { label: '신호', value: 'state[2:0]', color: '#3498db' },
      { label: '비트폭', value: '3 bits (6 states)' },
      { label: '전이', value: 'IDLE→DMA→SWAP→EXEC→DONE→ACK' },
      { label: '초기값', value: "ST_IDLE (3'b000)" },
    ],
    description: [
      '공장 전체 운영을 제어하는 관제탑 상태 레지스터.',
      '하역장(DMA) → 냉장고 교대 → 오븐 가동 → 완료 순서로 진행.',
      '',
      'ST_IDLE(0) → ST_LOAD_WT(1) → ST_LOAD_WT_WAIT(2)',
      '→ ST_EXEC_ACT(3) → ST_FLUSH(4) → ST_DONE(5)',
      '',
      '주문서(mmio_start_npu)가 들어오면 IDLE에서 출발,',
      '양념(weight) 적재 → 재료(activation) 조리 → 마무리(flush) → 출하.',
    ],
  },
  fsm_bank_sel: {
    icon: '🔄', title: 'A/B조 교대원', subtitle: 'bank_sel — npu_system_top.sv',
    category: '관제탑 · 핑퉁 냉장고 교대',
    stats: [
      { label: '신호', value: 'bank_sel', color: '#9b59b6' },
      { label: '비트폭', value: '1 bit (toggle)' },
      { label: '제어', value: 'mmio_swap_banks 펄스' },
      { label: '규칙', value: 'IDLE 상태에서만 교대' },
    ],
    description: [
      '양념 냉장고 ↔ 재료 냉장고 교대를 제어하는 1비트 토글.',
      '',
      'bank_sel=0: 하역트럭→냉장고A 적재, 오븐→냉장고B 꾸내기',
      'bank_sel=1: 하역트럭→냉장고B 적재, 오븐→냉장고A 꾸내기',
      '',
      '하역트럭이 새 재료를 채우는 동안, 오븐은 이전 재료로 조리.',
      'mmio_swap_banks 펄스 → bank_sel ^= 1',
    ],
  },
  fsm_exec_cnt: {
    icon: '🔢', title: '조리 카운터', subtitle: 'exec_cnt[15:0] — npu_system_top.sv',
    category: '관제탑 · 실행 제어',
    stats: [
      { label: '신호', value: 'exec_cnt[15:0]', color: '#2ecc71' },
      { label: '비트폭', value: '16 bits (0~65535)' },
      { label: '역할', value: '재료(Activation) 투입 횟수 추적' },
      { label: '완료 조건', value: 'exec_cnt == mmio_npu_seq_len' },
    ],
    description: [
      '오븐 가동(ST_EXEC_ACT) 상태에서 재료 투입 사이클을 세는 카운터.',
      '',
      '매 클럭 exec_cnt += 1,',
      'exec_cnt == mmio_npu_seq_len 도달 시 → ST_FLUSH(마무리) 전이.',
      '',
      `기본 타일: seq_len=${FACTORY.TILE_SIZE} → 16사이클 조리.`,
      'Split-K (K=32): seq_len=32 → 2패스 조리.',
    ],
  },

  // DMA workers
  dma_req_cnt: {
    icon: '📤', title: '하역 발주원', subtitle: 'req_cnt[15:0] — dma_controller.sv',
    category: '하역장 · AXI4 마스터',
    stats: [
      { label: '신호', value: 'req_cnt[15:0]', color: '#e67e22' },
      { label: '역할', value: 'AXI AR 발행 횟수 카운트' },
      { label: '완료', value: 'req_cnt == total_bursts' },
      { label: 'MAX_OUTSTANDING', value: `${FACTORY.MAX_OUTSTANDING}`, color: '#e74c3c' },
    ],
    description: [
      '하역트럭이 외부 창고에 발주(AR 요청)한 횟수 추적.',
      '',
      'can_issue = (다음 발주 < 총 발주량)',
      '         && (대기 중인 트럭 < MAX_OUTSTANDING)',
      '',
      'Bubble-free 배송 설계:',
      '  다음 사이클 발주를 미리 예측하여',
      '  매 사이클 AR 요청을 끊김 없이 발행.',
    ],
  },
  dma_resp_cnt: {
    icon: '📥', title: '하역 입고원', subtitle: 'resp_cnt[15:0] — dma_controller.sv',
    category: '하역장 · AXI4 마스터',
    stats: [
      { label: '신호', value: 'resp_cnt[15:0]', color: '#e67e22' },
      { label: '역할', value: 'AXI R 완료 응답 카운트' },
      { label: '완료 조건', value: 'resp_cnt == total_bursts → dma_done' },
      { label: '카운트 시점', value: 'rlast && rvalid && rready' },
    ],
    description: [
      '하역트럭이 실제로 적재를 마친 횟수(rlast) 추적.',
      '',
      'resp_cnt가 total_bursts에 도달하면:',
      '  busy=0, dma_done=1 (하역 완료 신호)',
      '',
      '냉장고에 실제 기록한 데이터 카운트와 동기화.',
    ],
  },
  dma_outstanding: {
    icon: '📊', title: '하역 교통정리원', subtitle: 'outstanding_cnt[7:0] — dma_controller.sv',
    category: '하역장 · AXI4 흐름제어',
    stats: [
      { label: '신호', value: 'outstanding_cnt[7:0]', color: '#f39c12' },
      { label: '최대값', value: `${FACTORY.MAX_OUTSTANDING}`, color: '#e74c3c' },
      { label: '증가', value: 'AR accept (arvalid & arready)' },
      { label: '감소', value: 'R last (rlast & rvalid)' },
    ],
    description: [
      '현재 하역장에서 대기 중인 트럭(트랜잭션) 수.',
      '',
      `최대 ${FACTORY.MAX_OUTSTANDING}대까지 동시 대기 가능.`,
      'outstanding < MAX → 새 트럭 발주 가능.',
      'outstanding == MAX → 발주 정지 (배압).',
      '',
      'Assertion: outstanding_cnt <= MAX_OUTSTANDING 항상 보장.',
    ],
  },

  // SRAM port workers (generic, parameterized in tooltip)
  sram0_write_port: makeSRAMPortInfo(0, 'write'),
  sram0_read_port: makeSRAMPortInfo(0, 'read'),
  sram1_write_port: makeSRAMPortInfo(1, 'write'),
  sram1_read_port: makeSRAMPortInfo(1, 'read'),
  sram2_write_port: makeSRAMPortInfo(2, 'write'),
  sram2_read_port: makeSRAMPortInfo(2, 'read'),
  sram3_write_port: makeSRAMPortInfo(3, 'write'),
  sram3_read_port: makeSRAMPortInfo(3, 'read'),

  // Conveyor workers
  skew_operator: {
    icon: '↗️', title: '전처리 정렬공 (Skew)', subtitle: 'delay_pipe — systolic_data_setup.sv',
    category: '전처리대 · 입구 정렬',
    stats: [
      { label: '구현', value: `${FACTORY.TILE_SIZE - 1}-stage shift register`, color: '#1abc9c' },
      { label: 'Row 0 지연', value: '0 cycles' },
      { label: `Row ${FACTORY.TILE_SIZE - 1} 지연`, value: `${FACTORY.TILE_SIZE - 1} cycles` },
      { label: '데이터', value: 'int8 activation per row' },
    ],
    description: [
      '오븐 입구에서 재료를 대각선 정렬하는 전처리 파이프라인.',
      '',
      'Row i는 i사이클 후에 오븐 좌측에 도착.',
      '이것이 "심장 박동(systolic)" 패턴을 만듦.',
      '',
      'Row 0: act[0] 즉시 투입',
      `Row ${FACTORY.TILE_SIZE - 1}: act[${FACTORY.TILE_SIZE - 1}]는 ${FACTORY.TILE_SIZE - 1}사이클 후 투입`,
    ],
  },
  deskew_operator: {
    icon: '↘️', title: '후처리 정렬공 (Deskew)', subtitle: 'deskew — systolic_array_16x16.sv',
    category: '전처리대 · 출구 정렬',
    stats: [
      { label: '구현', value: `${FACTORY.TILE_SIZE - 1}-stage column delay`, color: '#1abc9c' },
      { label: 'Col 0 지연', value: `${FACTORY.TILE_SIZE - 1} cycles` },
      { label: `Col ${FACTORY.TILE_SIZE - 1} 지연`, value: '0 cycles' },
      { label: '결과', value: '16 psum 동시 출력 정렬' },
    ],
    description: [
      '오븐 하단 출력에서 column별 시차를 보정.',
      '',
      'Column 0은 가장 늦게 결과가 나오므로 지연 없음,',
      `Column ${FACTORY.TILE_SIZE - 1}은 ${FACTORY.TILE_SIZE - 1}사이클 추가 대기.`,
      '',
      '→ 모든 16개 반조리품(psum)이 같은 사이클에 결과 보관소로 도착.',
    ],
  },

  // PE Grid workers
  pe_weight_loader: {
    icon: '🔧', title: '양념 장전공', subtitle: 'wt_load_shift[15:0] — npu_system_top.sv',
    category: '오븐 · 양념 Preload',
    stats: [
      { label: '구현', value: '1-hot barrel shifter', color: '#f39c12' },
      { label: '비트폭', value: '16 bits (row 0~15)' },
      { label: '소요', value: `${FACTORY.WEIGHT_PRELOAD_CYCLES} cycles` },
      { label: '대상', value: 'mac_pe.weight_reg[7:0]' },
    ],
    description: [
      '양념(weight) preload 시 한 번에 한 행씩 양념을 조리사(PE)에게 장전.',
      '',
      '동작:',
      "  Cycle 0: shift=16'h0001 → Row 0 조리사 양념 장전",
      "  Cycle 1: shift=16'h0002 → Row 1 조리사 양념 장전",
      '  ...',
      "  Cycle 15: shift=16'h8000 → Row 15 조리사 양념 장전",
      '',
      '냉장고에서 wt_data[127:0] 읽어 → 16개 lane에 분배.',
    ],
  },
  pe_act_feeder: {
    icon: '📦', title: '재료 투입공', subtitle: 'act_in_left[15:0] — npu_core_top.sv',
    category: '오븐 · 재료(Activation) Feed',
    stats: [
      { label: '데이터', value: 'int8 × 16 lanes', color: '#e74c3c' },
      { label: '소스', value: 'SRAM act bank → skew' },
      { label: '방향', value: '왼쪽 → 오른쪽 전파' },
      { label: '투입률', value: '1 vector/cycle' },
    ],
    description: [
      '냉장고에서 꾸낸 재료(activation)를 오븐 좌측에 투입.',
      '',
      'act_data[127:0] → 16개 int8 lane으로 분리',
      '→ 전처리대(systolic_data_setup)로 skew 처리 후',
      '→ 오븐 좌측 입력 (act_in_left[row])',
      '',
      '각 조리사(PE)에서: psum_out = psum_in + 재료 × 양념',
      '재료는 오른쪽 이웃 조리사로 전달 (act_out = act_in)',
    ],
  },
  pe_psum_collector: {
    icon: '🧲', title: '반조리품 수거공', subtitle: 'psum_bottom[15:0][31:0] — systolic_array_16x16.sv',
    category: '오븐 · 반조리품(Psum) Output',
    stats: [
      { label: '데이터', value: 'int32 × 16 columns', color: '#3498db' },
      { label: '방향', value: '위→아래 누적 후 하단 출력' },
      { label: '경유', value: 'Deskew → Accumulator' },
      { label: '파이프라인', value: `${FACTORY.PIPELINE_DEPTH} cycles 지연` },
    ],
    description: [
      '오븐 최하단 행의 반조리품(psum) 출력을 수거.',
      '',
      'Row 15의 각 조리사에서 나온 psum_out이',
      '16개 column별로 후처리(deskew)를 거쳐 정렬된 후',
      '결과 보관소(accumulator)로 전달.',
      '',
      `총 파이프라인 깊이: ${FACTORY.PIPELINE_DEPTH} cycles`,
      '  (15 skew + 1 array + 15 deskew)',
    ],
  },

  // Accumulator workers
  acc_writer: {
    icon: '📝', title: '결과 적재공', subtitle: 'acc_valid / acc_addr — psum_accumulator_buffer.sv',
    category: '결과 보관소 · Write Path',
    stats: [
      { label: '제어 신호', value: 'acc_valid, acc_addr[8:0]', color: '#8e44ad' },
      { label: 'BRAM 깊이', value: `${FACTORY.ACCUM_DEPTH} entries` },
      { label: '데이터폭', value: `${FACTORY.ACCUM_WIDTH_BITS} bits (16×int32)` },
      { label: '모드', value: 'acc_clear → overwrite / accumulate' },
    ],
    description: [
      '결과 보관소에 반조리품(psum)을 기록하는 포트.',
      '',
      'acc_clear=1: psum_buffer[addr] ← 새 반조리품 (덮어쓰기)',
      'acc_clear=0: psum_buffer[addr] ← 기존 + 새 반조리품 (누적)',
      '',
      '31-cycle pipeline delay를 거친 acc_valid_pipe[30]이',
      '실제 BRAM write enable으로 동작.',
    ],
  },
  acc_forwarder: {
    icon: '⚡', title: 'RAW 해결사', subtitle: 'forward_en — psum_accumulator_buffer.sv',
    category: '결과 보관소 · Hazard Bypass',
    stats: [
      { label: '신호', value: 'forward_en', color: '#e74c3c' },
      { label: '조건', value: 'acc_addr_q == last_write_addr' },
      { label: '해결', value: 'BRAM bypass → 최신값 전달' },
      { label: '중요도', value: '★★★ (없으면 데이터 오류)' },
    ],
    description: [
      '같은 보관함에 연속으로 적재할 때 발생하는 해저드.',
      '',
      '문제: 같은 주소에 연속으로 쓰면',
      '  BRAM read가 1사이클 늦어 헌 데이터를 읽음.',
      '',
      '해결: last_write_addr와 현재 acc_addr 비교,',
      '  일치하면 BRAM 대신 last_write_data를 forward.',
      '',
      'Split-K 조리에서 같은 보관함에 여러 K패스를 누적할 때 필수.',
    ],
  },
  acc_drainer: {
    icon: '🚚', title: '출하 담당', subtitle: 'drain_re / drain_addr — psum_accumulator_buffer.sv',
    category: '결과 보관소 · Drain Path',
    stats: [
      { label: '제어', value: 'drain_re, drain_addr[8:0]', color: '#1abc9c' },
      { label: '출력', value: 'psum_drain_out[15:0][31:0]' },
      { label: '지연', value: '1 cycle (BRAM read latency)' },
      { label: '행선지', value: 'Host 검증 비교' },
    ],
    description: [
      'ST_DONE(조리 완료) 상태에서 완성된 결과물을 외부로 출하.',
      '',
      '동작:',
      '  Host가 drain_addr를 설정, drain_re=1 펄스',
      '  → 다음 사이클에 psum_drain_out 유효',
      '',
      `타일당 ${FACTORY.TILE_SIZE}개 주소 drain (0~${FACTORY.TILE_SIZE - 1})`,
      '각 주소에서 16×int32 벡터 출력 → 품질검사동으로 전달.',
    ],
  },

  // Verification workers
  verify_golden: {
    icon: '✅', title: '레시피 비교원', subtitle: 'GoldenEntry[] — main.cpp',
    category: '품질검사동 · Core Replay',
    stats: [
      { label: '데이터', value: 'golden.json', color: '#5dade2' },
      { label: '비교 단위', value: 'drain_addr별 16×int32' },
      { label: '판정', value: 'lane별 exact match' },
      { label: '결과', value: 'PASS / FAIL + mismatch 상세' },
    ],
    description: [
      '레시피(golden.json) 대로 조리되었는지 확인하는 핵심 검사.',
      '',
      '워크로드 패키지의 레시피(golden.json)에서 기대값 로드,',
      '출하된 결과물(psum_drain_out)과 하나하나 비교.',
      '',
      '모든 drain_addr × 16 lanes가 일치하면 PASS.',
    ],
  },
  verify_axi_model: {
    icon: '🔌', title: '물류 모형 관리원', subtitle: 'AxiMemoryModel — system_replay_main.cpp',
    category: '품질검사동 · System Replay',
    stats: [
      { label: '모델', value: 'AxiMemoryModel', color: '#5dade2' },
      { label: '기능', value: 'AXI slave + burst response' },
      { label: '메모리', value: '1024×128bit mock SRAM' },
      { label: '대상', value: 'npu_system_top full sim' },
    ],
    description: [
      '전체 공장 시스템 시뮬레이션에서 외부 창고를 모사.',
      '',
      '하역트럭(AXI AR) 요청 수신 → burst 데이터 응답 생성,',
      'rlast 타이밍, rvalid/rready 핸드셰이크 관리.',
      '',
      'Host가 쓴 재료/양념 데이터를 보유.',
    ],
  },
  verify_uvm_seq: {
    icon: '🎲', title: '무작위 주문 발생기', subtitle: 'npu_seq_item — npu_uvm_pkg.sv',
    category: '품질검사동 · UVM Testbench',
    stats: [
      { label: '클래스', value: 'npu_seq_item', color: '#f39c12' },
      { label: 'Constraint', value: 'acc_addr ∈ {0,1,..,511}' },
      { label: 'Edge 가중치', value: '0,511 각 5%, 나머지 90%' },
      { label: '시퀀스', value: 'weight_load → execute → flush → drain' },
    ],
    description: [
      'UVM Transaction 기반 무작위 주문 생성기.',
      '',
      'SystemVerilog constraint로 주소 분포 제어:',
      '  acc_addr dist {0:=5, 511:=5, [1:510]:=90}',
      '',
      '시퀀스: weight_load(16cyc) → execute(20cyc)',
      '       → flush(35cyc) → drain(10cyc)',
    ],
  },
  verify_coverage: {
    icon: '📈', title: '합격률 측정원', subtitle: 'covergroup — npu_assert_coverage.sv',
    category: '품질검사동 · Sign-off',
    stats: [
      { label: 'Core CP', value: 'forwarding_hit, drain_request' },
      { label: 'System CP', value: 'dma_start, wt_load, execute_mode' },
      { label: 'Assertion', value: 'outstanding ≤ MAX, legal FSM' },
      { label: '목표', value: '100% coverpoint hit' },
    ],
    description: [
      'RTL 기능 커버리지와 SVA assertion 결합.',
      '',
      'Core assertions:',
      '  forwarding_hit 발생 여부 (RAW hazard 검증)',
      '  drain_request 정상 동작',
      '',
      'System assertions:',
      `  outstanding_cnt ≤ ${FACTORY.MAX_OUTSTANDING}`,
      '  FSM legal state transitions',
      '  bank_swap only in IDLE',
    ],
  },
  verify_ci_runner: {
    icon: '🤖', title: '자동 품질검사원', subtitle: 'Makefile — GitHub Actions',
    category: '품질검사동 · 자동화',
    stats: [
      { label: 'Targets', value: 'sim_core, sim_uvm, sim_system' },
      { label: '도구', value: 'Verilator + VCS (UVM)' },
      { label: '패키지', value: '9개 워크로드 자동 실행' },
      { label: '리포트', value: 'coverage summary + VCD' },
    ],
    description: [
      'GitHub Actions로 매 커밋마다 전체 품질검사 자동 실행.',
      '',
      'Makefile targets:',
      '  make sim_core PKG=... — Core-level 레시피 비교',
      '  make sim_system PKG=... — System-level 전체 라인 검사',
      '  make sim_uvm — UVM 무작위 주문 테스트',
      '',
      '모든 9개 워크로드에 대해 PASS 확인.',
    ],
  },
  verify_validator: {
    icon: '🔍', title: '포장 검수원', subtitle: 'validate_program() — validator.py',
    category: '품질검사동 · 포장검사',
    stats: [
      { label: '검사 대상', value: 'Program IR', color: '#2ecc71' },
      { label: '검사 항목', value: '주소정렬, 타일범위, golden존재' },
      { label: '시점', value: '포장 완료 직후' },
      { label: '결과', value: 'ValidationResult (PASS/FAIL)' },
    ],
    description: [
      '포장부(emitter)가 만든 패키지를 출하 전 최종 검수.',
      '',
      '검사 항목:',
      '  1. 주소 정렬 (alignment check)',
      '  2. 타일 범위 초과 여부',
      '  3. golden.json 존재 및 형식 일치',
      '',
      '불량 패키지가 공장(HW)에 도달하기 전 차단.',
    ],
  },
  verify_drift: {
    icon: '📏', title: '드리프트 감시원', subtitle: 'test_asset_binary_stability() — test_asset_drift.py',
    category: '품질검사동 · 드리프트감시',
    stats: [
      { label: '검사', value: 'SHA-256 해시 비교', color: '#e74c3c' },
      { label: '대상', value: 'activation/weight/golden JSON' },
      { label: '기준', value: '커밋 간 바이너리 동일성' },
      { label: '위반 시', value: 'CI 실패 + 경보' },
    ],
    description: [
      '워크로드 패키지의 바이너리가 커밋 간에 변하지 않는지 감시.',
      '',
      '컴파일러 코드 수정 후에도 같은 입력이면',
      '같은 패키지가 나와야 하는 결정론적 보장.',
      '',
      'SHA-256 해시로 이전 커밋 vs 현재 커밋 비교,',
      '불일치 시 "레시피가 변질됨" 경보 발생.',
    ],
  },

  // HQ workers
  hq_compiler_worker: {
    icon: '🏭', title: '공장장', subtitle: 'compile_program() — compiler.py',
    category: '사무동 · 총괄',
    stats: [
      { label: '파이프라인', value: '4단계', color: '#3498db' },
      { label: '1단계', value: 'Import (소스 통일)' },
      { label: '2단계', value: 'Plan (타일 + 스케줄)' },
      { label: '3단계', value: 'Build (JSON 패키지)' },
    ],
    description: [
      '공장 전체 파이프라인을 총괄하는 공장장.',
      '',
      '1. Import — 레시피(모델)를 공장 표준으로 통일',
      '2. Plan — 재료 절단 + 조리 순서 + 비용 견적',
      '3. Build — 작업 지시서(JSON 패키지) 생성',
      '4. Report — 매니페스트와 결과 객체 반환',
    ],
  },
  hq_tracer_worker: {
    icon: '📋', title: '접수 담당', subtitle: 'trace_torch_module() — tracer.py',
    category: '사무동 · 영업부',
    stats: [
      { label: '입력', value: 'torch.nn.Module', color: '#e74c3c' },
      { label: '출력', value: 'Program IR (straight-line)', color: '#2ecc71' },
      { label: '엔진', value: 'torch.fx symbolic trace' },
      { label: '지원 Op', value: 'linear, conv2d, relu, flatten, ...' },
    ],
    description: [
      '고객의 레시피(PyTorch 모델)를 접수하여',
      '공장 내부 표준(IR)으로 변환하는 접수 담당.',
      '',
      'torch.fx로 심볼릭 추적 후',
      'straight-line mini IR 노드 리스트 생성.',
    ],
  },
  hq_ir_worker: {
    icon: '📐', title: '공정 분류공', subtitle: 'lower_program_to_steps() — ir.py',
    category: '사무동 · 공정변환실',
    stats: [
      { label: '입력', value: 'straight-line IR', color: '#e74c3c' },
      { label: '출력', value: 'LoweredOp[]', color: '#2ecc71' },
      { label: '판단', value: 'compute vs non-compute 분류' },
      { label: '핵심', value: 'operator별 공정 유형 결정' },
    ],
    description: [
      '접수된 레시피의 각 공정이 오븐(compute)이 필요한지',
      '단순 가공(non-compute)인지 분류하는 분류공.',
      '',
      'linear → compute (오븐 필요)',
      'relu, flatten → non-compute (단순 가공)',
      '',
      'LoweredOp 리스트를 다음 단계(절단실)에 전달.',
    ],
  },
  hq_lowering_worker: {
    icon: '✂️', title: '절단 기사', subtitle: 'plan_linear_tiles() — lowering.py',
    category: '사무동 · 절단실',
    stats: [
      { label: 'TILE_SIZE', value: `${FACTORY.TILE_SIZE}`, color: '#f39c12' },
      { label: '분할 축', value: 'M / N / K', color: '#3498db' },
      { label: '출력', value: 'TilePlanEntry[]' },
      { label: '예시', value: '64×128 → 32 tiles' },
    ],
    description: [
      `큰 재료를 ${FACTORY.TILE_SIZE}×${FACTORY.TILE_SIZE} 단위로 절단.`,
      '',
      'M방향: 출력 행 절단',
      'N방향: 출력 열 절단',
      'K방향: 내적 축 절단 (Split-K)',
      '',
      '각 절단 조각에 (tile_m, tile_n, tile_k) 좌표 부여.',
    ],
  },
  hq_scheduler_worker: {
    icon: '📅', title: '순서 최적화공', subtitle: 'reorder_tiles() — scheduler.py',
    category: '사무동 · 생산관리부',
    stats: [
      { label: '전략', value: 'weight_reuse (양념 재사용)', color: '#f39c12' },
      { label: 'Reuse 절감', value: `${FACTORY.REUSE_SAVING_PER_TILE} cyc/tile`, color: '#2ecc71' },
      { label: '함수', value: 'estimate_tile_cost()' },
      { label: '분석', value: 'analyze_memory_usage()' },
    ],
    description: [
      '같은 양념(weight)을 사용하는 조각을 연속 배치하여',
      '하역트럭 양념 운반 + 오븐 장전 비용을 절감.',
      '',
      `절감: ${FACTORY.REUSE_SAVING_PER_TILE}사이클/재사용 당`,
      '(하역 양념 17cyc + 장전 16cyc 스킵)',
    ],
  },
  hq_emitter_worker: {
    icon: '📦', title: '포장 기사', subtitle: 'export_linear_tiled_package() — emitter.py',
    category: '사무동 · 포장부',
    stats: [
      { label: '출력', value: 'manifest.json + payload', color: '#2ecc71' },
      { label: '내용물', value: '재료/양념/레시피 JSON' },
      { label: '메타데이터', value: 'schedule_metadata' },
      { label: '검증용', value: 'IR validate_program()' },
    ],
    description: [
      '작업 지시서를 디스크에 JSON 패키지로 포장.',
      '',
      '조각별 activation.json(재료), weights.json(양념),',
      'golden.json(레시피 정답) 생성.',
      'manifest.json에 실행 메타데이터 기록.',
    ],
  },
  hq_replay_bridge_worker: {
    icon: '🚚', title: '배송 변환공', subtitle: 'export_replay_packages() — replay_bridge.py',
    category: '사무동 · 물류부',
    stats: [
      { label: '입력', value: 'SW JSON 패키지', color: '#e74c3c' },
      { label: '출력', value: 'HW replay 패키지', color: '#2ecc71' },
      { label: '변환', value: 'MMIO 주소 + AXI 파라미터' },
      { label: '대상', value: 'System replay testbench' },
    ],
    description: [
      '포장부(emitter)가 만든 SW 패키지를',
      'HW 시뮬레이션이 이해하는 형식으로 변환.',
      '',
      'JSON → MMIO register 값 매핑,',
      'activation/weight → AXI burst 파라미터 생성.',
      '',
      '공장(SW) ↔ 물류(HW) 사이의 번역가 역할.',
    ],
  },
};

// ─── Helpers ───────────────────────────────────────────────────

function makeSRAMPortInfo(bank: number, port: 'read' | 'write'): EntityInfo {
  const group = bank < 2 ? '양념' : '재료';
  const isWrite = port === 'write';
  return {
    icon: isWrite ? '✍️' : '📖',
    title: `${isWrite ? '냉장 입고원' : '냉장 출고원'} (Port ${isWrite ? 'A' : 'B'})`,
    subtitle: `dp_sram_bank.sv — Bank ${bank}`,
    category: `냉장고 · Bank ${bank} [${group}]`,
    stats: [
      { label: '포트', value: isWrite ? 'Port A (Write)' : 'Port B (Read)', color: isWrite ? '#2ecc71' : '#3498db' },
      { label: '데이터폭', value: `${FACTORY.SRAM_WIDTH_BITS} bits (${FACTORY.TILE_SIZE}×int8)` },
      { label: '주소폭', value: '10 bits (1024 depth)' },
      { label: '지연', value: isWrite ? '0 cycle (동기 쓰기)' : '1 cycle (동기 읽기)' },
    ],
    description: [
      `Dual-port 냉장고 Bank ${bank}의 ${isWrite ? '적재(하역트럭→냉장고)' : '출고(냉장고→오븐)'} 포트.`,
      '',
      isWrite
        ? '하역트럭이 AXI burst 수신 시 sram_wen=1, sram_wdata 기록.'
        : '오븐이 양념 적재/조리 시 raddr로 데이터 요청.',
      '',
      `핑퐁 규칙: bank_sel에 따라 하역트럭과 오븐이`,
      `서로 다른 냉장고를 점유하여 동시 접근 가능.`,
    ],
  };
}

// ─── WORKER_TOOLTIP ────────────────────────────────────────────

const WORKER_TOOLTIP: Record<string, TooltipData> = {};
for (const w of WORKERS) {
  WORKER_TOOLTIP[w.id] = {
    title: `${w.badge} ${w.name}`,
    lines: [w.role, '클릭하여 상세 보기'],
  };
}

// ─── Public API ────────────────────────────────────────────────

export function getWorkerInfo(workerId: string): EntityInfo | null {
  return WORKER_DETAIL[workerId] ?? null;
}

export function getWorkerTooltip(workerId: string): TooltipData {
  return WORKER_TOOLTIP[workerId] ?? { title: '작업자', lines: ['정보 없음'] };
}
