import { render, screen } from '@testing-library/react';
import BomTreePanel from './BomTreePanel';
import { BomTreeNode } from '../../../../types/bom';

const materialNode = (overrides: Partial<BomTreeNode> = {}): BomTreeNode => ({
  key: 'm1',
  nodeType: 'MATERIAL',
  itemSeq: 200,
  label: '부품A',
  itemNo: 'MAT-200',
  itemSpec: 'SPEC-200',
  procSeq: 10,
  needQty: 2,
  unitName: 'EA',
  children: [],
  ...overrides,
});

const processNode = (overrides: Partial<BomTreeNode> = {}): BomTreeNode => ({
  key: 'p1',
  nodeType: 'PROCESS',
  itemSeq: 100,
  label: '공정 10',
  procSeq: 10,
  children: [materialNode()],
  ...overrides,
});

describe('BomTreePanel', () => {
  it('로딩 중이면 로딩 메시지를 보여준다', () => {
    render(<BomTreePanel nodes={[]} loading />);
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('노드가 없으면 안내 메시지를 보여준다', () => {
    render(<BomTreePanel nodes={[]} loading={false} />);
    expect(screen.getByText('등록된 BOM이 없습니다.')).toBeInTheDocument();
  });

  it('공정 노드와 자재 노드를 계층적으로 렌더링한다', () => {
    render(<BomTreePanel nodes={[processNode()]} loading={false} />);
    expect(screen.getByText('공정 10')).toBeInTheDocument();
    expect(screen.getByText(/부품A/)).toBeInTheDocument();
  });

  it('반제품 하위 BOM처럼 다단계로 중첩된 노드도 기본적으로 펼쳐서 렌더링한다', () => {
    const nested = processNode({
      children: [
        materialNode({
          key: 'm1',
          children: [
            processNode({
              key: 'p2',
              procSeq: 20,
              children: [materialNode({ key: 'm2', label: '원자재C' })],
            }),
          ],
        }),
      ],
    });
    render(<BomTreePanel nodes={[nested]} loading={false} />);
    expect(screen.getByText('공정 20')).toBeInTheDocument();
    expect(screen.getByText(/원자재C/)).toBeInTheDocument();
  });
});
