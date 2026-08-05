import { render, screen } from '@testing-library/react';
import BomTreePanel from './BomTreePanel';
import { BomTreeRow } from '../../../../types/bom';

const treeRow = (overrides: Partial<BomTreeRow> = {}): BomTreeRow => ({
  depth: '01',
  itemSeq: 100,
  itemCode: 'PRD-100',
  itemName: '제품A',
  matItemSeq: 200,
  matItemNo: 'MAT-200',
  matItemName: '부품A',
  matItemSpec: 'SPEC-200',
  ...overrides,
});

describe('BomTreePanel', () => {
  it('노드가 없으면 안내 메시지를 보여준다', () => {
    render(<BomTreePanel nodes={[]} loading={false} />);
    expect(screen.getByText('등록된 BOM이 없습니다')).toBeInTheDocument();
  });

  it('제품/자재 정보를 그리드 행으로 렌더링한다', () => {
    render(<BomTreePanel nodes={[treeRow()]} loading={false} />);
    expect(screen.getByText('제품A')).toBeInTheDocument();
    expect(screen.getByText('PRD-100')).toBeInTheDocument();
    expect(screen.getByText('부품A')).toBeInTheDocument();
    expect(screen.getByText('MAT-200')).toBeInTheDocument();
    expect(screen.getByText('SPEC-200')).toBeInTheDocument();
  });

  it('다단계 BOM의 각 레벨을 별도 행으로 렌더링한다', () => {
    const rows = [
      treeRow({ depth: '01', itemSeq: 100, matItemSeq: 200, matItemName: '반제품B' }),
      treeRow({
        depth: '01-01',
        itemSeq: 200,
        itemCode: 'MAT-200',
        itemName: '반제품B(부모)',
        matItemSeq: 300,
        matItemNo: 'MAT-300',
        matItemName: '원자재C',
        matItemSpec: 'SPEC-300',
      }),
    ];
    render(<BomTreePanel nodes={rows} loading={false} />);
    expect(screen.getByText('반제품B(부모)')).toBeInTheDocument();
    expect(screen.getByText('원자재C')).toBeInTheDocument();
  });
});
