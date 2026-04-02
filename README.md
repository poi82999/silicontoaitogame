# NPU Factory Pipeline Visualizer

16×16 Systolic Array 기반 NPU의 HW/SW 스택을 **2D 공장 시뮬레이터**로 시각화합니다.
비전공자도 "NPU가 뭘 하는 건지" 이해할 수 있도록 설계되었습니다.

## 시각적 컨셉

Factorio / Shapez.io 스타일의 탑다운 2D 팩토리 뷰.

- **본사** (왼쪽): L6 Toolchain 컴파일러 파이프라인 5단계
- **공장** (중앙): RTL 하드웨어 — FSM, DMA, SRAM, 16×16 PE 그리드, Accumulator
- **검증** (오른쪽): Core Replay, System Replay, UVM, Sign-off, CI
- **타임라인** (하단): 1타일 생산 99사이클 애니메이션

## 조작법

| 키 | 동작 |
|----|------|
| Space | 재생/일시정지 |
| ← → | 사이클 단위 이동 |
| R | Weight Reuse 토글 (99 vs 66 사이클) |
| ↑ ↓ | 속도 조절 |
| PE 클릭 | mac_pe 연산 상세 보기 |

## 기술 스택

- [Phaser 3](https://phaser.io/) — 2D 게임 엔진
- TypeScript
- Vite

## 개발

```bash
npm install
npm run dev
```

## 빌드 & 배포

```bash
npm run build    # dist/ 에 빌드
```

GitHub Pages: `dist/` 디렉토리를 배포하거나 GitHub Actions 사용.

## 참조 문서

- [factory_analogy_architecture.md](./factory_analogy_architecture.md) — 전체 HW/SW 스택 공장 비유 설계 문서
