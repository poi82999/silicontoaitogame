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
  compiler: {
    icon: '🏭',
    title: '0F 공장장실',
    subtitle: 'compiler.py — compile_program()',
    category: '사무동 · 0층',
    stats: [
      { label: '역할', value: '전체 라인 총괄', color: '#ffd700' },
      { label: '입력', value: 'CompilerOptions (작업지시서)' },
      { label: '출력', value: 'CompilerResult + manifest', color: '#2ecc71' },
      { label: '파이프라인', value: '4단계' },
    ],
    description: [
      '공장장(compile_program())은 1층 ~ 5층 전체를 총괄합니다.',
      '',
      '작업 지시서 (CompilerOptions):',
      '  package_id — 주문번호',
      '  tiled=True — "한 입 크기로 자를 것"',
      '  schedule_strategy="weight_reuse" — 양념 재사용 최적화',
      '  replay_enabled — 시식까지 할 건지',
      '',
      '4단계: Import → Plan → Build → Report',
      '마지막에 compile_manifest.json (출하 보고서) 작성.',
    ],
  },
  tracer: {
    icon: '📋',
    title: '1F 영업부',
    subtitle: 'tracer.py — trace_torch_module()',
    category: '사무동 · 1층',
    stats: [
      { label: '입력', value: 'PyTorch 레시피북 (nn.Module)', color: '#e74c3c' },
      { label: '출력', value: 'Program IR (표준 주문서)', color: '#2ecc71' },
      { label: '스캐너', value: 'torch.fx symbolic trace' },
      { label: '지원 요리법', value: '8종류' },
    ],
    description: [
      '고객이 PyTorch 레시피북(nn.Module)을 가져오면,',
      'torch.fx 스캐너로 한 장씩 분석합니다.',
      '',
      '지원 요리법 8가지:',
      '  linear(볶음), conv2d(철판볶음), relu(쓴맛제거)',
      '  add(합치기), batch_norm(간맞추기)',
      '  max_pool2d(맛있는부분만), flatten(한줄나열)',
      '',
      '결과: 표준 주문서(Program)',
      '  TensorValue(재료목록) + OpNode(조리순서)',
    ],
  },
  ir: {
    icon: '📐',
    title: '2A 공정변환실',
    subtitle: 'ir.py — lower_program_to_steps()',
    category: '사무동 · 2층-A',
    stats: [
      { label: '판단', value: '오븐(systolic) vs 손가공', color: '#f39c12' },
      { label: '오븐 공정', value: 'gemm, conv2d_im2col_gemm' },
      { label: '간단 가공', value: 'shape_only, elementwise' },
      { label: '검증', value: 'validate_program()' },
    ],
    description: [
      '주문서를 공장 내부 공정 지시서(LoweredOp)로 바꿉니다.',
      '',
      '핵심 판단: "이 요리는 오븐을 써야 하나?"',
      '',
      '오븐 사용 공정 (compute-backed):',
      '  gemm — 재료(act) × 양념(weight) = 결과물',
      '  conv2d_im2col — 2D 재료를 펼쳐서 gemm 처리',
      '',
      '간단 가공 (non-compute):',
      '  shape_only — 그릇 모양만 바꿈 (flatten)',
      '  elementwise — 간단한 후처리 (relu, add 등)',
    ],
  },
  lowering: {
    icon: '✂️',
    title: '2B 식재료 절단실',
    subtitle: 'lowering.py — plan_linear_tiles()',
    category: '사무동 · 2층-B',
    stats: [
      { label: 'TILE_SIZE', value: `${FACTORY.TILE_SIZE} (오븐 규격)`, color: '#f39c12' },
      { label: '분할 단위', value: 'TilePlanEntry (포장 스티커)' },
      { label: '차원', value: 'M / N / K 3방향 분할' },
      { label: '꼬다리 처리', value: '_pad_matrix()로 0 채움' },
    ],
    description: [
      '큰 재료 덩어리를 오븐 크기(16×16)에 맞게 자릅니다.',
      '',
      '예: M=48, K=32, N=20 볶음 주문 →',
      '  M방향: ceil(48/16)=3조각',
      '  K방향: ceil(32/16)=2겹 (split-K)',
      '  N방향: ceil(20/16)=2열 (16+4 꼬다리)',
      '  → 총 3×2×2 = 12개 타일',
      '',
      '꼬다리(tail): tile_n=4인 조각은',
      '나머지 12칸을 0으로 채워서 16×16 규격에 맞춤.',
    ],
  },
  scheduler: {
    icon: '📅',
    title: '3F 생산관리부',
    subtitle: 'scheduler.py — reorder_tiles()',
    category: '사무동 · 3층',
    stats: [
      { label: '양념 교체 비용', value: `${FACTORY.REUSE_SAVING_PER_TILE} cyc`, color: '#f1c40f' },
      { label: 'Flush 비용', value: `${FACTORY.FLUSH_CYCLES} cyc (오븐 세척)`, color: '#3498db' },
      { label: 'Reuse 절감', value: `${FACTORY.REUSE_SAVING_PER_TILE} cyc/tile`, color: '#2ecc71' },
      { label: '전략', value: 'weight_reuse (양념 재사용)', color: '#f39c12' },
    ],
    description: [
      '12개 타일 조각의 조리 순서를 최적화합니다.',
      '',
      '핵심: 양념 재사용 (weight_reuse)',
      '  양념(weight) 적재: 17사이클 (DMA 16행 + 오버헤드1)',
      '  예열: 16사이클 → 합계 33사이클',
      '  같은 양념 타일을 연속 → 양념 교체 = 0!',
      '',
      '비용 견적 (estimate_tile_cost):',
      '  dma_weight=17, dma_act=tile_m+1',
      `  preload=16, execute=tile_m, flush=${FACTORY.FLUSH_CYCLES}`,
      '  drain=tile_m, swap=2',
    ],
  },
  emitter: {
    icon: '📦',
    title: '4F 포장부',
    subtitle: 'emitter.py — export_linear_tiled_package()',
    category: '사무동 · 4층',
    stats: [
      { label: '출력 형식', value: 'JSON manifest + payload', color: '#2ecc71' },
      { label: '내용물', value: 'activations / weights / golden' },
      { label: '메타데이터', value: 'schedule_metadata' },
      { label: '순서', value: 'scheduler ordered_tiles 반영' },
    ],
    description: [
      '최적 순서대로 타일을 JSON 파일로 포장합니다.',
      '',
      '📦 compute_package/',
      '  ├ manifest.json — 포장 라벨',
      '  ├ tiles.json — 타일 목록 (scheduler 순서!)',
      '  └ tiles/tile_000/',
      '      ├ activations.json (16×16 int8)',
      '      ├ weights.json (16×16 int8)',
      '      └ golden.json (정답지)',
      '',
      'golden.json: drain_addr, vector[16] int32',
      '"이렇게 나와야 정답" 검수표.',
    ],
  },
  replay_bridge: {
    icon: '🚚',
    title: '5F 물류부',
    subtitle: 'replay_bridge.py — export_replay_packages()',
    category: '사무동 · 5층',
    stats: [
      { label: '변환', value: 'SW 패키지 → HW MMIO 형식', color: '#e67e22' },
      { label: '묶음', value: '같은 (m,n) k-pass 그룹핑' },
      { label: '주소 매핑', value: 'weights_src=0, act_src=8192' },
      { label: '출력', value: 'replay_packages/' },
    ],
    description: [
      '포장된 패키지를 오븐(RTL)이 이해하는 형식으로 변환.',
      '',
      'SW 필드 → HW MMIO 대응:',
      '  weights_src_addr → mmio_src_addr',
      '  weight_burst_len → mmio_burst_len',
      '  acc_clear → mmio_npu_acc_clear',
      '  seq_len → mmio_npu_seq_len',
      `  flush_cycles → ${FACTORY.FLUSH_CYCLES} FSM 카운터`,
      '',
      '같은 출력 위치의 k-pass들을',
      '하나의 replay 패키지로 묶어 전달.',
    ],
  },
};

const HQ_TOOLTIP: Record<string, TooltipData> = {
  compiler: { title: '공장장실 (compiler.py)', lines: ['전체 라인 총괄 — 4단계 파이프라인', '클릭하여 상세 보기'] },
  tracer: { title: '영업부 (tracer.py)', lines: ['PyTorch 레시피 → 주문서(IR) 변환', '클릭하여 상세 보기'] },
  ir: { title: '공정변환실 (ir.py)', lines: ['오븐 사용 vs 간단가공 판단', '클릭하여 상세 보기'] },
  lowering: { title: '절단실 (lowering.py)', lines: [`재료 → ${FACTORY.TILE_SIZE}×${FACTORY.TILE_SIZE} 한입크기 절단`, '클릭하여 상세 보기'] },
  scheduler: { title: '생산관리부 (scheduler.py)', lines: ['양념 재사용 순서 최적화', '클릭하여 상세 보기'] },
  emitter: { title: '포장부 (emitter.py)', lines: ['JSON 포장 + golden 정답지 첨부', '클릭하여 상세 보기'] },
  replay_bridge: { title: '물류부 (replay_bridge.py)', lines: ['SW→HW MMIO 배송 형식 변환', '클릭하여 상세 보기'] },
};

// ─── Factory components ───

export function getFSMDetail(state: string): EntityInfo {
  const stateInfo: Record<string, { desc: string[]; signal: string }> = {
    IDLE: {
      signal: '대기',
      desc: ['관제탑이 다음 조리 명령을 기다리는 상태.', '모든 장비 비활성.', 'ack 수신 시 DONE에서 복귀.'],
    },
    DMA: {
      signal: 'mmio_start_dma=1',
      desc: [
        '하역 트럭(DMA)가 외부 창고에서 재료/양념을 반입합니다.',
        '',
        'mmio_src_addr[63:0] — 외부 창고 주소',
        'mmio_dma_target[1:0] — 양념(0) / 재료(1)',
        'mmio_burst_len[7:0] — 트럭 적재량',
        '',
        `AXI4 512bit 수송로, 동시 ${FACTORY.MAX_OUTSTANDING}대 운행`,
      ],
    },
    SWAP: {
      signal: 'bank_swap',
      desc: [
        '핑퐁 냉장고 교대.',
        'A냉장고에 채우는 동안 B냉장고에서 꺼내 쓰고,',
        '완료되면 A↔B 교대합니다.',
        `소요: ${FACTORY.BANK_SWAP_CYCLES} cycle`,
      ],
    },
    EXEC: {
      signal: 'mmio_mode = preload/execute/drain/flush',
      desc: [
        '오븐(systolic array)이 실제 조리하는 상태.',
        '',
        'mmio_mode[2:0] 에 따라:',
        `  preload — 양념 장전 (${FACTORY.WEIGHT_PRELOAD_CYCLES}cyc)`,
        `  execute — MAC 조리 (${FACTORY.TILE_SIZE}cyc)`,
        `  flush   — 오븐 세척 (${FACTORY.FLUSH_CYCLES}cyc)`,
        `  drain   — 결과 추출 (${FACTORY.TILE_SIZE}cyc)`,
      ],
    },
    DONE: {
      signal: 'done=1',
      desc: ['조리 완료 보고 상태.', '관제탑이 done 신호를 발행합니다.'],
    },
    ACK: {
      signal: 'ack=1',
      desc: ['Host가 완료를 승인하는 상태.', 'ack 수신 후 IDLE로 복귀합니다.'],
    },
  };

  const info = stateInfo[state] ?? { signal: '?', desc: ['Unknown state'] };

  return {
    icon: '🏗️',
    title: `관제탑: ${state}`,
    subtitle: 'npu_system_top.sv — 6단계 FSM',
    category: '지하 · 관제실',
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
  const isWeight = bankIndex < 2;
  const typeLabel = isWeight ? '양념(weight)' : '재료(activation)';
  const groupLabel = bankIndex % 2 === 0 ? 'A' : 'B';
  return {
    icon: '🧊',
    title: `${typeLabel} 냉장고 ${groupLabel}`,
    subtitle: 'dp_sram_bank.sv — Ping-Pong',
    category: '지하 · 핑퐁 냉장고',
    stats: [
      { label: '용량', value: `${FACTORY.SRAM_BANK_SIZE_KB}KB`, color: '#2ecc71' },
      { label: 'Depth', value: `${FACTORY.SRAM_DEPTH} entries` },
      { label: 'Width', value: `${FACTORY.SRAM_WIDTH_BITS}bit (= int8 × 16)` },
      { label: '종류', value: `${typeLabel} · 냉장고 ${groupLabel}` },
    ],
    description: [
      `128bit = 16레인 × 8bit = 정확히 한 행(16개 int8).`,
      '',
      '핑퐁 원리:',
      '  bank_sel=0 → DMA가 A에 적재, 오븐은 B에서 읽음',
      '  bank_sel=1 → DMA가 B에 적재, 오븐은 A에서 읽음',
      '',
      '한쪽에서 재료를 넣는 동안 다른 쪽에서 꺼내 씀.',
      '→ 적재 대기 시간 = 0. 이것이 핑퐁의 핵심.',
      '',
      `전체 냉장고: ${FACTORY.SRAM_BANKS}칸 × ${FACTORY.SRAM_BANK_SIZE_KB}KB = ${FACTORY.SRAM_TOTAL_KB}KB`,
    ],
  };
}

export function getPEDetail(row: number, col: number): EntityInfo {
  return {
    icon: '🔥',
    title: `조리사[${row}][${col}]`,
    subtitle: 'mac_pe.sv — Multiply-Accumulate',
    category: '지하 · 오븐',
    stats: [
      { label: '양념통(weight_reg)', value: 'int8 (한번 장전, 계속 사용)', color: '#f39c12' },
      { label: '재료(act_in)', value: 'int8 (벨트로 흘러옴)', color: '#e74c3c' },
      { label: '중간합(psum_in)', value: 'int32 (위 조리사에서)', color: '#3498db' },
      { label: '결과(psum_out)', value: 'int32 (아래로 전달)', color: '#3498db' },
      { label: 'Skew 지연', value: `${row} cycles` },
      { label: 'Deskew 지연', value: `${col} cycles` },
    ],
    description: [
      '레시피: psum_out = psum_in + act_in × weight_reg',
      '',
      'Weight-Stationary (양념고정) 구조:',
      `  양념은 preload(${FACTORY.WEIGHT_PRELOAD_CYCLES}cyc)때 한번 장전,`,
      '  execute 동안 바꾸지 않고 계속 사용.',
      '',
      '데이터 흐름:',
      '  재료(act) → 왼쪽에서 오른쪽으로 벨트 전달',
      '  중간합(psum) → 위에서 아래로 누적 전달',
      '  act_out = act_in → "내가 볶았고 옆 사람도 볶아야지"',
    ],
  };
}

export function getConveyorDetail(): EntityInfo {
  return {
    icon: '🥘',
    title: '전처리대',
    subtitle: 'systolic_data_setup.sv',
    category: '지하 · 조리장',
    stats: [
      { label: '입구 (Skew)', value: `row[i] → i사이클 지연 (최대 ${FACTORY.TILE_SIZE - 1})` },
      { label: '출구 (Deskew)', value: `col[j] → (15-j)사이클 지연` },
      { label: '오븐 크기', value: `${FACTORY.TILE_SIZE}×${FACTORY.TILE_SIZE}` },
    ],
    description: [
      '재료(activation)를 오븐에 넣기 전에',
      '시간차를 두고 순차 투입하는 전처리대.',
      '',
      'Skew (입구):',
      '  row[0]: 즉시 투입 (0사이클 지연)',
      '  row[1]: 1사이클 후 투입',
      `  row[${FACTORY.TILE_SIZE - 1}]: ${FACTORY.TILE_SIZE - 1}사이클 후 투입`,
      '',
      '왜? systolic array의 핵심:',
      '재료가 파도처럼 왼쪽→오른쪽으로 흘러가야 하기 때문.',
      '',
      'Deskew (출구): 16개 결과가 동시에 나오도록 정렬.',
    ],
  };
}

export function getAccumulatorDetail(): EntityInfo {
  return {
    icon: '�️',
    title: '결과 보관소',
    subtitle: 'psum_accumulator_buffer.sv',
    category: '지하 · 출하장',
    stats: [
      { label: 'Depth', value: `${FACTORY.ACCUM_DEPTH}칸 선반`, color: '#8e44ad' },
      { label: 'Width', value: `${FACTORY.ACCUM_WIDTH_BITS}bit (int32 × ${FACTORY.TILE_SIZE})` },
      { label: '총 용량', value: `${FACTORY.ACCUM_TOTAL_KB}KB`, color: '#2ecc71' },
      { label: 'RAW Forwarding', value: '지원 (★★★)', color: '#e74c3c' },
    ],
    description: [
      '오븐에서 나온 중간 결과물을 쌓아두는 선반.',
      '',
      'Split-K에서의 역할:',
      '  acc_clear=true → 새 접시에 담아라 (1번째 겹)',
      '  acc_clear=false → 기존에 더해라 (2번째 겹~)',
      '',
      'RAW Forwarding — 가장 정교한 부분:',
      '  사이클 T에서 선반[5]에 쓰고,',
      '  사이클 T+1에서 선반[5]를 읽으면 → 옛날 값!',
      '  last_write_data로 bypass 전달.',
      '',
      `${FACTORY.ACCUM_DEPTH}칸 × ${FACTORY.ACCUM_WIDTH_BITS}bit = ${FACTORY.ACCUM_TOTAL_KB}KB`,
    ],
  };
}

export function getDMADetail(): EntityInfo {
  return {
    icon: '🚛',
    title: '하역장 (DMA)',
    subtitle: 'dma_controller.sv',
    category: '지하 · 하역장',
    stats: [
      { label: 'AXI 수송로', value: `${FACTORY.AXI_DATA_WIDTH_DMA}bit (64B/beat)`, color: '#e67e22' },
      { label: '주소 폭', value: `${FACTORY.AXI_ADDR_WIDTH}bit (전세계 창고)` },
      { label: '동시 배차', value: `${FACTORY.MAX_OUTSTANDING}대`, color: '#e74c3c' },
      { label: '오버헤드', value: `${FACTORY.DMA_OVERHEAD_CYCLES} cycle` },
    ],
    description: [
      '외부 메모리(AXI 버스)에서 재료/양념을 실어 나르는 트럭 부대.',
      '',
      '사양:',
      `  주소 폭: ${FACTORY.AXI_ADDR_WIDTH}bit (전세계 어느 창고든 지정)`,
      `  데이터 폭: ${FACTORY.AXI_DATA_WIDTH_DMA}bit/beat (한번에 64바이트)`,
      `  MAX_OUTSTANDING=${FACTORY.MAX_OUTSTANDING} (빈 트럭 돌아오기 전 ${FACTORY.MAX_OUTSTANDING}대 발송)`,
      '',
      '추적 카운터:',
      '  req_cnt — 보낸 트럭 수',
      '  resp_cnt — 돌아온 트럭 수',
      `  outstanding_cnt — 길 위 트럭 (≤${FACTORY.MAX_OUTSTANDING})`,
    ],
  };
}

// ─── Verification steps ───

const VERIFY_DETAIL: Record<string, EntityInfo> = {
  core_replay: {
    icon: '🔬',
    title: '시식 검사 (단위)',
    subtitle: 'Core Replay — main.cpp (Verilator)',
    category: '품질검사동',
    stats: [
      { label: '방식', value: '1타일 golden bit-exact 비교' },
      { label: '도구', value: 'Verilator (C++ 모델)' },
      { label: '비교 대상', value: 'golden.json vs RTL drain' },
    ],
    description: [
      '포장된 패키지 하나를 꺼내서,',
      '재료(act)/양념(weight)을 직접 코어에 넣고,',
      '나온 결과물을 golden과 레인별(16개) 비교.',
      '',
      'signed int8 경계값 처리도 검증.',
    ],
  },
  system_replay: {
    icon: '🏭',
    title: '라인 가동 검사',
    subtitle: 'System Replay — system_replay_main.cpp',
    category: '품질검사동',
    stats: [
      { label: '패턴', value: 'multi-tile, bank-swap, chained' },
      { label: '범위', value: 'DMA→SRAM→핑퐁→코어→drain 전체' },
    ],
    description: [
      'DMA → SRAM → 핑퐁 → 코어 → drain 전체 라인 가동.',
      '여러 패키지를 체인으로 연속 투입.',
      '',
      '추적: DMA done 횟수, NPU done 횟수,',
      'FSM 전이 로그, signed int8 경계값.',
    ],
  },
  validator: {
    icon: '📋',
    title: '포장 검사',
    subtitle: 'validator.py',
    category: '품질검사동',
    stats: [
      { label: '방식', value: '파일시스템 구조 검증' },
      { label: '확인 항목', value: 'manifest, tile count, golden' },
    ],
    description: [
      '파일시스템의 포장 패키지가 규격에 맞는지 확인:',
      '  manifest.json 구조, tile count 일치,',
      '  golden.json 존재 여부.',
      '',
      '포장 불량을 사전에 잡아냄.',
    ],
  },
  drift: {
    icon: '🔄',
    title: '드리프트 감시',
    subtitle: 'test_asset_drift.py',
    category: '품질검사동',
    stats: [
      { label: '방식', value: '회귀 자산 비트 비교' },
      { label: '대상', value: '커밋된 자산 vs 재생성 결과' },
    ],
    description: [
      '커밋된 회귀 테스트 자산이',
      '현재 코드로 재생성한 것과 비트 단위 동일한지 확인.',
      '',
      '무의식적인 코드 변경이 자산 불일치를',
      '일으키는 것을 방지합니다.',
    ],
  },
  uvm: {
    icon: '🎲',
    title: '무작위 스트레스 검사',
    subtitle: 'UVM Testbench',
    category: '품질검사동',
    stats: [
      { label: '방식', value: 'constrained-random' },
      { label: '커버리지', value: 'coverage-driven' },
    ],
    description: [
      'UVM(Universal Verification Methodology)으로',
      '무작위 입력을 생성하여 스트레스 테스트.',
      '',
      'constrained-random: 유효 범위 내에서 무작위 값',
      'coverage-driven: 커버 안 된 영역 집중 공략',
    ],
  },
  signoff: {
    icon: '✅',
    title: '검사 기준서',
    subtitle: 'L5 Sign-off Gate',
    category: '품질검사동',
    stats: [
      { label: '게이트 수', value: '12개 수치' },
      { label: '기준', value: 'assertion 0, coverage ≥ target%' },
    ],
    description: [
      '12개 수치 게이트를 통과해야 sign-off.',
      '',
      '  assertion hit count = 0',
      '  functional coverage ≥ target%',
      '  code coverage ≥ target%',
      '  regression pass rate = 100%',
      '',
      'Repeatability: 동일 seed 2회 → 동일 결과.',
    ],
  },
  ci: {
    icon: '🤖',
    title: '자동 검사 라인',
    subtitle: 'GitHub Actions CI',
    category: '품질검사동',
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

const VERIFY_KEYS = ['core_replay', 'system_replay', 'validator', 'drift', 'uvm', 'signoff', 'ci'];
const VERIFY_TOOLTIP: Record<string, TooltipData> = {
  core_replay: { title: '시식 검사', lines: ['1타일 golden bit-exact', '클릭하여 상세 보기'] },
  system_replay: { title: '라인 검사', lines: ['DMA→핑퐁→코어 전체 가동', '클릭하여 상세 보기'] },
  validator: { title: '포장 검사', lines: ['파일시스템 규격 확인', '클릭하여 상세 보기'] },
  drift: { title: '드리프트 감시', lines: ['회귀 자산 비트 비교', '클릭하여 상세 보기'] },
  uvm: { title: '스트레스 검사', lines: ['constrained-random UVM', '클릭하여 상세 보기'] },
  signoff: { title: 'L5 Sign-off', lines: ['12개 수치 게이트', '클릭하여 상세 보기'] },
  ci: { title: '자동 검사 (CI)', lines: ['GitHub Actions', '클릭하여 상세 보기'] },
};

// ─── Exports ───

export const HQ_KEYS = ['compiler', 'tracer', 'ir', 'lowering', 'scheduler', 'emitter', 'replay_bridge'];

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

// ─── External Buildings ───

function getDRAMDetail(): EntityInfo {
  return {
    icon: '🏚️',
    title: 'DRAM 외부창고',
    subtitle: 'Off-chip DRAM',
    category: '외부 · 메모리',
    stats: [
      { label: '역할', value: '양념/재료 원자재 보관', color: '#ffd700' },
      { label: '인터페이스', value: `AXI4 ${FACTORY.AXI_DATA_WIDTH_DMA}bit`, color: '#e67e22' },
      { label: '용량', value: '수 GB (외부 메모리)' },
      { label: '연결', value: 'DMA 하역장 경유' },
    ],
    description: [
      'NPU 칩 외부의 DRAM 메모리입니다.',
      '양념(weight)과 재료(activation) 원자재가 보관됩니다.',
      '',
      'DMA 하역장이 이 창고에서 데이터를 가져와',
      '공장 내부 냉장고(SRAM)에 적재합니다.',
      '완성된 결과물도 다시 이 창고로 출하됩니다.',
    ],
  };
}

function getHostDetail(): EntityInfo {
  return {
    icon: '🖥️',
    title: '호스트 PC',
    subtitle: 'Host CPU + NPU Driver',
    category: '외부 · 호스트',
    stats: [
      { label: '역할', value: 'NPU 컴파일 & 드라이버', color: '#ffd700' },
      { label: '소프트웨어', value: 'compiler.py + driver' },
      { label: '출력', value: '작업지시서 → 공장장실' },
      { label: '연결', value: '사무동 경유' },
    ],
    description: [
      '신경망 모델을 컴파일하고 NPU를 구동하는 호스트입니다.',
      '',
      'compiler.py가 PyTorch 모델을 받아',
      'IR 변환 → 타일링 → 스케줄링 → 패키지를 거쳐',
      '최종 HW 패키지를 생성합니다.',
      '드라이버가 DRAM에 데이터를 배치하고 NPU를 기동합니다.',
    ],
  };
}

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
    case 'dram':
      return getDRAMDetail();
    case 'host':
      return getHostDetail();
    default:
      return null;
  }
}

export function getTooltipData(type: string, id?: string | number, id2?: number): TooltipData {
  switch (type) {
    case 'hq':
      return HQ_TOOLTIP[id as string] ?? { title: '?', lines: [] };
    case 'fsm':
      return { title: `관제탑: ${id}`, lines: ['6단계 FSM 관제', '클릭하여 상세 보기'] };
    case 'sram':
      return { title: `냉장고 Bank ${id}`, lines: [`${FACTORY.SRAM_BANK_SIZE_KB}KB 핑퐁 냉장고`, '클릭하여 상세 보기'] };
    case 'pe':
      return { title: `조리사[${id}][${id2}]`, lines: ['psum = psum_in + 재료 × 양념', '클릭하여 상세 보기'] };
    case 'conveyor':
      return { title: '전처리대', lines: ['재료 시간차 투입 (skew/deskew)', '클릭하여 상세 보기'] };
    case 'accumulator':
      return { title: '결과 보관소', lines: [`${FACTORY.ACCUM_DEPTH}칸 선반 = ${FACTORY.ACCUM_TOTAL_KB}KB`, '클릭하여 상세 보기'] };
    case 'dma':
      return { title: '하역 트럭 (DMA)', lines: [`AXI4 ${FACTORY.AXI_DATA_WIDTH_DMA}bit 수송로`, '클릭하여 상세 보기'] };
    case 'verify':
      return VERIFY_TOOLTIP[id as string] ?? { title: '?', lines: [] };
    case 'dram':
      return { title: 'DRAM 외부창고', lines: ['외부 메모리 — 양념/재료 원자재 창고', '클릭하여 상세 보기'] };
    case 'host':
      return { title: '호스트 PC', lines: ['NPU 드라이버 실행 호스트', '클릭하여 상세 보기'] };
    default:
      return { title: '?', lines: [] };
  }
}
