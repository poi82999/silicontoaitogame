import { FACTORY } from './config';

/** Entity info displayed in the inspector panel */
export interface EntityInfo {
  icon: string;
  title: string;
  subtitle: string;
  category: string;
  stats: { label: string; value: string; color?: string }[];
  description: string[];
}

/** Short hover-tooltip text */
export interface TooltipData {
  title: string;
  lines: string[];
}

// ─── HQ Steps ───

const HQ_DETAIL: Record<string, EntityInfo> = {
  tracer: {
    icon: '📋',
    title: '주문접수부',
    subtitle: 'tracer.py',
    category: '본사 · L6 Toolchain',
    stats: [
      { label: '입력', value: 'torch.nn.Module', color: '#e74c3c' },
      { label: '출력', value: 'Program IR', color: '#2ecc71' },
      { label: '핵심 함수', value: 'trace_torch_module()' },
      { label: '지원 Op', value: '8종류' },
    ],
    description: [
      '고객 도면(PyTorch 모델)을 내부 사양서(Program IR)로 변환합니다.',
      '',
      '지원 부품:',
      '  linear, conv2d, relu, flatten,',
      '  add, bias_add, reshape, getattr',
      '',
      'torch.fx 기반 그래프 추출 → straight-line mini IR 생성.',
      '고객이 "Linear(64, 128)" 제출 → 내부 표준양식으로 변환.',
    ],
  },
  lowering: {
    icon: '✂️',
    title: '공정설계부',
    subtitle: 'lowering.py',
    category: '본사 · L6 Toolchain',
    stats: [
      { label: 'TILE_SIZE', value: `${FACTORY.TILE_SIZE}`, color: '#f39c12' },
      { label: '분할 단위', value: 'TilePlanEntry' },
      { label: '핵심 함수', value: 'plan_linear_tiles()' },
      { label: '차원', value: 'M / N / K 분할' },
    ],
    description: [
      '큰 행렬 연산을 공장이 한 번에 처리할 수 있는',
      `${FACTORY.TILE_SIZE}×${FACTORY.TILE_SIZE} 타일 단위로 자동 분할합니다.`,
      '',
      '예시: 64×128 행렬',
      `  M방향: ${64 / FACTORY.TILE_SIZE}칸, N방향: ${128 / FACTORY.TILE_SIZE}칸, K방향: 1칸`,
      `  = 총 ${(64 / FACTORY.TILE_SIZE) * (128 / FACTORY.TILE_SIZE)} 타일 생산 계획`,
      '',
      '각 TilePlanEntry에는 tile_m, tile_n, tile_k 좌표가 기록됩니다.',
    ],
  },
  scheduler: {
    icon: '📅',
    title: '일정관리부',
    subtitle: 'scheduler.py',
    category: '본사 · L6 Toolchain',
    stats: [
      { label: 'Preload 비용', value: `${FACTORY.WEIGHT_PRELOAD_CYCLES} cyc`, color: '#f1c40f' },
      { label: 'Flush 비용', value: `${FACTORY.FLUSH_CYCLES} cyc`, color: '#3498db' },
      { label: 'Reuse 절감', value: `${FACTORY.REUSE_SAVING_PER_TILE} cyc/tile`, color: '#2ecc71' },
      { label: '전략', value: 'weight_reuse', color: '#f39c12' },
    ],
    description: [
      '타일 생산 순서를 최적화합니다.',
      '',
      '핵심 최적화: weight_reuse 전략',
      '같은 weight 블록을 쓰는 타일을 연속 배치 →',
      '금형을 다시 장착하지 않고 다음 activation만 투입.',
      '',
      `DMA weight(17cyc) + preload(${FACTORY.WEIGHT_PRELOAD_CYCLES}cyc)`,
      `= 총 ${FACTORY.REUSE_SAVING_PER_TILE}사이클 절감/재사용 당`,
      '',
      '함수: estimate_tile_cost(), reorder_tiles(),',
      '      analyze_memory_usage()',
    ],
  },
  compiler: {
    icon: '🏗️',
    title: '설계부 (총괄)',
    subtitle: 'compiler.py',
    category: '본사 · L6 Toolchain',
    stats: [
      { label: '핵심 함수', value: 'compile_program()' },
      { label: '입력', value: 'Source (any format)', color: '#e74c3c' },
      { label: '출력', value: 'CompilerResult', color: '#2ecc71' },
      { label: '파이프라인', value: '4단계' },
    ],
    description: [
      '생산총괄 이사 — 주문→계획→생산→보고 전 과정 총괄.',
      '',
      '4단계 파이프라인:',
      '  1. Import  — 모든 소스를 Program으로 통일',
      '  2. Plan    — 타일 분할 + 스케줄링 + 비용 예측',
      '  3. Build   — JSON 패키지 파일 생성',
      '  4. Report  — 매니페스트와 결과 객체 반환',
      '',
      'CompilerOptions로 package_id, output_dir,',
      'schedule_strategy 등을 설정합니다.',
    ],
  },
  emitter: {
    icon: '📦',
    title: '출하문서부',
    subtitle: 'emitter.py + ir.py',
    category: '본사 · L6 Toolchain',
    stats: [
      { label: '핵심 함수', value: 'export_program_package()' },
      { label: '출력 형식', value: 'JSON manifest + payload', color: '#2ecc71' },
      { label: 'IR 검증', value: 'validate_program()' },
      { label: '메타데이터', value: 'schedule_metadata' },
    ],
    description: [
      '생산지시서를 작성합니다.',
      '',
      'export_linear_tiled_package():',
      '  타일별 activation/weight/golden JSON 생성',
      '',
      'export_program_package():',
      '  multi-step program을 디렉토리 구조로 출력',
      '',
      '각 step manifest에는 schedule_metadata가 포함:',
      '  strategy, cycles, dma, memory 정보',
    ],
  },
};

const HQ_TOOLTIP: Record<string, TooltipData> = {
  tracer: { title: '주문접수 (tracer.py)', lines: ['PyTorch 모델 → IR 변환', '클릭하여 상세 보기'] },
  lowering: { title: '공정설계 (lowering.py)', lines: [`행렬 → ${FACTORY.TILE_SIZE}×${FACTORY.TILE_SIZE} 타일 분할`, '클릭하여 상세 보기'] },
  scheduler: { title: '일정관리 (scheduler.py)', lines: ['타일 순서 최적화', '클릭하여 상세 보기'] },
  compiler: { title: '설계총괄 (compiler.py)', lines: ['4단계 파이프라인 총괄', '클릭하여 상세 보기'] },
  emitter: { title: '출하문서 (emitter.py)', lines: ['JSON 패키지 생성', '클릭하여 상세 보기'] },
};

// ─── Factory components ───

export function getFSMDetail(state: string): EntityInfo {
  const stateInfo: Record<string, { desc: string[]; signal: string }> = {
    IDLE: {
      signal: '대기',
      desc: ['Host의 명령을 기다리는 초기 상태.', '모든 내부 신호 비활성.', 'ack 수신 시 DONE에서 복귀.'],
    },
    DMA: {
      signal: 'mmio_start_dma=1',
      desc: [
        'DMA 지게차가 외부 메모리에서 데이터를 반입합니다.',
        '',
        'mmio_src_addr[63:0] — 외부 주소',
        'mmio_dma_target[1:0] — weight(0) / act(1)',
        'mmio_burst_len[7:0] — burst 길이',
        '',
        `AXI4 512bit bus, MAX_OUTSTANDING=${FACTORY.MAX_OUTSTANDING}`,
      ],
    },
    SWAP: {
      signal: 'bank_swap',
      desc: [
        '창고 A↔B 교대 (ping-pong).',
        'phase_sel 전환으로 DMA가 채운 쪽과',
        '코어가 읽는 쪽을 바꿉니다.',
        `소요: ${FACTORY.BANK_SWAP_CYCLES} cycle`,
      ],
    },
    EXEC: {
      signal: 'mmio_mode = preload/execute/drain/flush',
      desc: [
        '코어가 실제 연산을 수행하는 상태.',
        '',
        'mmio_mode[2:0] 에 따라:',
        `  preload — 금형 장착 (${FACTORY.WEIGHT_PRELOAD_CYCLES}cyc)`,
        `  execute — MAC 연산 (${FACTORY.TILE_SIZE}cyc)`,
        `  flush   — 파이프라인 비움 (${FACTORY.FLUSH_CYCLES}cyc)`,
        `  drain   — 결과 출하 (${FACTORY.TILE_SIZE}cyc)`,
      ],
    },
    DONE: {
      signal: 'done=1',
      desc: ['코어가 작업 완료를 보고한 상태.', 'system이 done 신호를 인지합니다.'],
    },
    ACK: {
      signal: 'ack=1',
      desc: ['Host가 완료를 승인하는 상태.', 'ack 수신 후 IDLE로 복귀합니다.'],
    },
  };

  const info = stateInfo[state] ?? { signal: '?', desc: ['Unknown state'] };

  return {
    icon: '🚦',
    title: `FSM State: ${state}`,
    subtitle: 'npu_system_top.sv — 경비실',
    category: '공장 · 정문/물류센터',
    stats: [
      { label: '상태', value: state, color: `#${(COLORS_FSM[state] ?? 0x888888).toString(16)}` },
      { label: '신호', value: info.signal },
      { label: '전체 FSM', value: FACTORY.FSM_STATES.join(' → ') },
    ],
    description: info.desc,
  };
}

// We need the raw color values for hex conversion
const COLORS_FSM: Record<string, number> = {
  IDLE: 0x95a5a6, DMA: 0xe67e22, SWAP: 0x9b59b6,
  EXEC: 0x2ecc71, DONE: 0x3498db, ACK: 0x1abc9c,
};

export function getSRAMDetail(bankIndex: number): EntityInfo {
  return {
    icon: '🏪',
    title: `SRAM Bank ${bankIndex}`,
    subtitle: 'dp_sram_bank.sv',
    category: '공장 · 창고',
    stats: [
      { label: '용량', value: `${FACTORY.SRAM_BANK_SIZE_KB}KB`, color: '#2ecc71' },
      { label: 'Depth', value: `${FACTORY.SRAM_DEPTH} entries` },
      { label: 'Width', value: `${FACTORY.SRAM_WIDTH_BITS} bit` },
      { label: 'Ping-Pong 조', value: bankIndex < 2 ? 'A조 (Bank 0-1)' : 'B조 (Bank 2-3)' },
    ],
    description: [
      `듀얼포트 SRAM 뱅크 — ${FACTORY.SRAM_DEPTH} × ${FACTORY.SRAM_WIDTH_BITS}bit`,
      '',
      'Ping-Pong 운영:',
      '  DMA가 A조에 다음 재료를 채우는 동안,',
      '  코어는 B조에서 현재 재료를 꺼내 생산.',
      '  완료되면 A↔B 교대 (bank_swap).',
      '',
      `전체 창고: ${FACTORY.SRAM_BANKS}개 뱅크 × ${FACTORY.SRAM_BANK_SIZE_KB}KB = ${FACTORY.SRAM_TOTAL_KB}KB`,
      '',
      '포트: 1 Read + 1 Write (dual-port)',
      'DMA가 쓰고, 코어가 읽음 → 동시 접근 가능.',
    ],
  };
}

export function getPEDetail(row: number, col: number): EntityInfo {
  return {
    icon: '⚙️',
    title: `PE[${row}][${col}]`,
    subtitle: 'mac_pe.sv — Multiply-Accumulate',
    category: '공장 · 생산라인',
    stats: [
      { label: 'weight_reg', value: 'int8 (금형)', color: '#f39c12' },
      { label: 'act_in', value: 'int8 (재료)', color: '#e74c3c' },
      { label: 'psum_in', value: 'int32 (위에서)', color: '#3498db' },
      { label: 'psum_out', value: 'int32 (아래로)', color: '#3498db' },
      { label: 'Skew delay', value: `${row} cycles` },
      { label: 'Deskew delay', value: `${col} cycles` },
    ],
    description: [
      '연산: psum_out = psum_in + act_in × weight_reg',
      '',
      'Weight-Stationary 구조:',
      `  금형(weight)은 preload(${FACTORY.WEIGHT_PRELOAD_CYCLES}cyc)때 장착,`,
      '  execute 동안 고정 유지.',
      '',
      '데이터 흐름:',
      '  activation → 왼쪽에서 오른쪽으로 전파',
      '  psum → 위에서 아래로 누적 전달',
      '',
      `  row[${row}]는 ${row}사이클 후에 투입 (skew)`,
      `  col[${col}]는 ${col}사이클 후에 추출 (deskew)`,
      '',
      'signed int8 × int8 → int32 누적',
    ],
  };
}

export function getConveyorDetail(): EntityInfo {
  return {
    icon: '🔄',
    title: '정렬 컨베이어',
    subtitle: 'systolic_data_setup.sv',
    category: '공장 · 생산동',
    stats: [
      { label: '입구 (Skew)', value: `row[i] → ${FACTORY.TILE_SIZE - 1}cyc 최대 지연` },
      { label: '출구 (Deskew)', value: `col[j] → ${FACTORY.TILE_SIZE - 1}cyc 최대 지연` },
      { label: 'Array 크기', value: `${FACTORY.TILE_SIZE}×${FACTORY.TILE_SIZE}` },
    ],
    description: [
      'Systolic array가 올바르게 동작하려면',
      '입력이 대각선으로 들어가야 합니다.',
      '',
      'Skew (입구):',
      '  row[0]: 0사이클 지연',
      '  row[1]: 1사이클 지연',
      `  row[${FACTORY.TILE_SIZE - 1}]: ${FACTORY.TILE_SIZE - 1}사이클 지연`,
      '',
      'Deskew (출구):',
      '  col[0]: 0사이클 지연',
      `  col[${FACTORY.TILE_SIZE - 1}]: ${FACTORY.TILE_SIZE - 1}사이클 지연`,
      '',
      '직선 데이터 → 대각선 변환 컨베이어벨트.',
    ],
  };
}

export function getAccumulatorDetail(): EntityInfo {
  return {
    icon: '📥',
    title: '완제품 창고',
    subtitle: 'psum_accumulator_buffer.sv',
    category: '공장 · 생산동',
    stats: [
      { label: 'Depth', value: `${FACTORY.ACCUM_DEPTH} entries`, color: '#8e44ad' },
      { label: 'Width', value: `${FACTORY.ACCUM_WIDTH_BITS} bit (32b × ${FACTORY.TILE_SIZE})` },
      { label: '총 용량', value: `${FACTORY.ACCUM_TOTAL_KB}KB`, color: '#2ecc71' },
      { label: 'RAW Forwarding', value: '지원', color: '#e74c3c' },
    ],
    description: [
      '3가지 모드:',
      '  accumulate — 기존 값 + 새 값 (Split-K용)',
      '  clear      — 새 타일 시작 시 선반 비움',
      '  drain      — 선반에서 꺼내 외부로 전달',
      '',
      'RAW forwarding:',
      '  같은 주소 연속 쓰기→읽기 시 bypass.',
      '  이걸 안 하면 1사이클 stall 발생.',
      '  작업자가 넣는 순간 바로 다음 읽기에 전달.',
      '',
      `${FACTORY.ACCUM_DEPTH} entry × ${FACTORY.ACCUM_WIDTH_BITS}bit`,
      `= ${FACTORY.ACCUM_TOTAL_KB}KB 총 용량.`,
    ],
  };
}

export function getDMADetail(): EntityInfo {
  return {
    icon: '🚛',
    title: '지게차 (DMA)',
    subtitle: 'dma_controller.sv',
    category: '공장 · 정문/물류센터',
    stats: [
      { label: 'AXI Bus', value: `${FACTORY.AXI_DATA_WIDTH_DMA}bit (64B/beat)`, color: '#e67e22' },
      { label: 'Addr Width', value: `${FACTORY.AXI_ADDR_WIDTH}bit` },
      { label: 'Max Outstanding', value: `${FACTORY.MAX_OUTSTANDING} bursts` },
      { label: 'Overhead', value: `${FACTORY.DMA_OVERHEAD_CYCLES} cycle` },
    ],
    description: [
      '외부 창고(main memory)에서 데이터를 가져와',
      'SRAM 창고에 내려놓는 역할.',
      '',
      'AXI4 Master 인터페이스:',
      `  m_axi_araddr[${FACTORY.AXI_ADDR_WIDTH - 1}:0]`,
      '  m_axi_arlen[7:0]',
      `  ${FACTORY.AXI_DATA_WIDTH_DMA}bit data bus (64 bytes/beat)`,
      '',
      `최대 ${FACTORY.MAX_OUTSTANDING}개 burst 동시 처리.`,
      '',
      '1회 DMA 전송: TILE_SIZE + overhead',
      `= ${FACTORY.TILE_SIZE} + ${FACTORY.DMA_OVERHEAD_CYCLES} = ${FACTORY.TILE_SIZE + FACTORY.DMA_OVERHEAD_CYCLES} cycles`,
    ],
  };
}

// ─── Verification steps ───

const VERIFY_DETAIL: Record<string, EntityInfo> = {
  core_replay: {
    icon: '🔬',
    title: '시제품 단건 검사',
    subtitle: 'Core Replay (Verilator)',
    category: '검증',
    stats: [
      { label: '방식', value: '1타일 golden bit-exact 비교' },
      { label: '도구', value: 'Verilator' },
      { label: '비교 대상', value: 'L6 golden vs RTL output' },
    ],
    description: [
      '1타일씩 생산한 결과를 golden 데이터와',
      'bit-exact으로 비교합니다.',
      '',
      'Verilator로 RTL을 C++ 모델로 변환 후',
      'cycle-accurate 시뮬레이션 수행.',
    ],
  },
  system_replay: {
    icon: '🏭',
    title: '전체 라인 가동 검사',
    subtitle: 'System Replay',
    category: '검증',
    stats: [
      { label: '패턴', value: 'multi-tile, bank-swap, chained' },
      { label: '검증 범위', value: '전체 시스템' },
    ],
    description: [
      'multi-tile, bank-swap, chained 패턴을',
      '포함한 전체 시스템 레벨 검증.',
      '',
      'replay_bridge.py가 생산지시서를',
      '검사용 replay workload로 변환.',
      '',
      'WSL에서 실제 시뮬레이션 실행 →',
      'pass/fail 결과 확인.',
    ],
  },
  uvm: {
    icon: '🎲',
    title: '무작위 스트레스 검사',
    subtitle: 'UVM Testbench',
    category: '검증',
    stats: [
      { label: '방식', value: 'constrained-random' },
      { label: '커버리지', value: 'coverage-driven' },
    ],
    description: [
      'UVM(Universal Verification Methodology)으로',
      '무작위 입력을 생성하여 스트레스 테스트.',
      '',
      'constrained-random: 유효 범위 내에서 무작위 값 생성',
      'coverage-driven: 커버 안 된 영역을 집중 공략',
    ],
  },
  signoff: {
    icon: '✅',
    title: '검사 기준서',
    subtitle: 'L5 Sign-off Gate',
    category: '검증',
    stats: [
      { label: '게이트 수', value: '12개 수치' },
      { label: '기준', value: 'assertion hit, coverage %' },
    ],
    description: [
      '12개 수치 게이트를 통과해야 sign-off.',
      '',
      '포함 항목:',
      '  assertion hit count = 0',
      '  functional coverage ≥ target%',
      '  code coverage ≥ target%',
      '  regression pass rate = 100%',
      '',
      'Repeatability: 동일 seed 2회 실행 →',
      '동일 결과 확인.',
    ],
  },
  ci: {
    icon: '🤖',
    title: '자동 검사 라인',
    subtitle: 'GitHub Actions CI',
    category: '검증',
    stats: [
      { label: '트리거', value: 'push마다 자동 실행' },
      { label: '범위', value: 'L5 sign-off 전체' },
    ],
    description: [
      'push마다 GitHub Actions가 자동으로',
      'L5 sign-off 전체를 실행.',
      '',
      '실패 시 PR merge 차단.',
    ],
  },
};

const VERIFY_KEYS = ['core_replay', 'system_replay', 'uvm', 'signoff', 'ci'];
const VERIFY_TOOLTIP: Record<string, TooltipData> = {
  core_replay: { title: '시제품 검사', lines: ['1타일 golden bit-exact', '클릭하여 상세 보기'] },
  system_replay: { title: '전체 가동 검사', lines: ['multi-tile system replay', '클릭하여 상세 보기'] },
  uvm: { title: '스트레스 검사', lines: ['constrained-random UVM', '클릭하여 상세 보기'] },
  signoff: { title: 'L5 Sign-off', lines: ['12개 수치 게이트', '클릭하여 상세 보기'] },
  ci: { title: '자동 검사 (CI)', lines: ['GitHub Actions', '클릭하여 상세 보기'] },
};

// ─── Exports ───

export const HQ_KEYS = ['tracer', 'lowering', 'scheduler', 'compiler', 'emitter'];

export const HQ_STEP_DATA = HQ_KEYS.map((key) => ({
  key,
  label: HQ_DETAIL[key].title + ' (' + HQ_DETAIL[key].subtitle + ')',
  shortLabel: HQ_DETAIL[key].title,
  desc: HQ_TOOLTIP[key].lines[0],
}));

export const VERIFY_STEP_DATA = VERIFY_KEYS.map((key) => ({
  key,
  label: VERIFY_DETAIL[key].title,
  shortLabel: VERIFY_DETAIL[key].subtitle,
  desc: VERIFY_TOOLTIP[key].lines[0],
}));

export function getEntityInfo(type: string, id?: string | number, id2?: number): EntityInfo | null {
  switch (type) {
    case 'hq':
      return HQ_DETAIL[id as string] ?? null;
    case 'fsm':
      return getFSMDetail(id as string);
    case 'sram':
      return getSRAMDetail(id as number);
    case 'pe':
      return getPEDetail(id as number, id2 as number);
    case 'conveyor':
      return getConveyorDetail();
    case 'accumulator':
      return getAccumulatorDetail();
    case 'dma':
      return getDMADetail();
    case 'verify':
      return VERIFY_DETAIL[id as string] ?? null;
    default:
      return null;
  }
}

export function getTooltipData(type: string, id?: string | number, id2?: number): TooltipData {
  switch (type) {
    case 'hq':
      return HQ_TOOLTIP[id as string] ?? { title: '?', lines: [] };
    case 'fsm':
      return { title: `FSM: ${id}`, lines: ['경비실 상태 머신', '클릭하여 상세 보기'] };
    case 'sram':
      return { title: `SRAM Bank ${id}`, lines: [`${FACTORY.SRAM_BANK_SIZE_KB}KB, ${FACTORY.SRAM_DEPTH}×${FACTORY.SRAM_WIDTH_BITS}b`, '클릭하여 상세 보기'] };
    case 'pe':
      return { title: `PE[${id}][${id2}]`, lines: ['psum = psum_in + act × weight', '클릭하여 상세 보기'] };
    case 'conveyor':
      return { title: '정렬 컨베이어', lines: ['skew/deskew data setup', '클릭하여 상세 보기'] };
    case 'accumulator':
      return { title: '완제품 창고', lines: [`${FACTORY.ACCUM_DEPTH}×${FACTORY.ACCUM_WIDTH_BITS}b = ${FACTORY.ACCUM_TOTAL_KB}KB`, '클릭하여 상세 보기'] };
    case 'dma':
      return { title: 'DMA 지게차', lines: [`AXI4 ${FACTORY.AXI_DATA_WIDTH_DMA}bit bus`, '클릭하여 상세 보기'] };
    case 'verify':
      return VERIFY_TOOLTIP[id as string] ?? { title: '?', lines: [] };
    default:
      return { title: '?', lines: [] };
  }
}
