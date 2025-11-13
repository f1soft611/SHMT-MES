import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
} from '@mui/material';
import {
    Extension as ExtensionIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import {ProcessFlowItemTab, ProcessFlowProcessTab} from "./index";

interface ProcessFlowDetailDialogProps {
  open: boolean;
  onClose: () => void;

    processRows: any[];  // 공정 리스트
    itemRows: any[];     // 제품 리스트

}

const ProcessFlowDetailDialog: React.FC<ProcessFlowDetailDialogProps> = ({
  open,
  onClose,
     processRows,
     itemRows
}) => {
    const [tabIndex, setTabIndex] = React.useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>공정흐름 상세 관리</DialogTitle>
      <DialogContent dividers={true}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label="공정 관리" icon={<BuildIcon />} iconPosition="start" />
              <Tab
                  label="제품 관리"
                  icon={<ExtensionIcon />}
                  iconPosition="start"
              />
          </Tabs>
          <Box sx={{ mt: 2 }}>
              {/* 공정 관리 그리드 */}
              {tabIndex === 0 && (
                  <ProcessFlowProcessTab rows={processRows} />
              )}

              {/* 제품 관리 그리드 */}
              {tabIndex === 1 && (
                  <ProcessFlowItemTab rows={itemRows} />
              )}
          </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessFlowDetailDialog;
