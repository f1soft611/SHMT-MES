import React from 'react';
import { Box, Typography } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { BomTreeNode } from '../../../../types/bom';

interface BomTreePanelProps {
  nodes: BomTreeNode[];
  loading: boolean;
}

const formatMaterialLabel = (node: BomTreeNode): string => {
  const parts = [node.label];
  if (node.itemNo) {
    parts.push(`(${node.itemNo})`);
  }
  if (node.needQty !== null && node.needQty !== undefined) {
    const qty = node.needQty.toLocaleString('ko-KR', { maximumFractionDigits: 5 });
    parts.push(`- ${qty}${node.unitName ? ` ${node.unitName}` : ''}`);
  }
  return parts.join(' ');
};

const collectKeys = (nodes: BomTreeNode[]): string[] =>
  nodes.flatMap((node) => [node.key, ...collectKeys(node.children)]);

const renderNode = (node: BomTreeNode): React.ReactNode => (
  <TreeItem
    key={node.key}
    itemId={node.key}
    label={node.nodeType === 'PROCESS' ? `공정 ${node.procSeq}` : formatMaterialLabel(node)}
  >
    {node.children.map(renderNode)}
  </TreeItem>
);

const BomTreePanel: React.FC<BomTreePanelProps> = ({ nodes, loading }) => {
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2">불러오는 중...</Typography>
      </Box>
    );
  }

  if (nodes.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          등록된 BOM이 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <SimpleTreeView defaultExpandedItems={collectKeys(nodes)}>
      {nodes.map(renderNode)}
    </SimpleTreeView>
  );
};

export default BomTreePanel;
