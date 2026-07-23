import React, { useEffect, useRef, useState } from 'react';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Build as BuildIcon,
  Extension as ExtensionIcon,
} from '@mui/icons-material';
import type { ProcessFlow } from '../../../../types/processFlow';
import ConfirmDialog from '../../../../components/common/Feedback/ConfirmDialog';
import { useToast } from '../../../../components/common/Feedback/ToastProvider';
import ProcessFlowItemTab from './ProcessFlowItemTab';
import ProcessFlowProcessTab from './ProcessFlowProcessTab';
import { ProcessFlowDetailProvider } from '../detail/ProcessFlowDetailProvider';
import { useDetailSessionContext } from '../detail/DetailSessionContext';
import { useItemDraftContext } from '../detail/ItemDraftContext';
import { useProcessDraftContext } from '../detail/ProcessDraftContext';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedFlow: ProcessFlow | null;
  initialTab: number;
}

function TabLabel({ text, dirty }: { text: string; dirty: boolean }) {
  return <span>{dirty ? `${text} *` : text}</span>;
}

function DetailDialogContent() {
  const session = useDetailSessionContext();

  return (
    <>
      <Tabs
        value={session.tabIndex}
        onChange={(_, value) => session.setTabIndex(value)}
      >
        <Tab
          label={<TabLabel text="공정 관리" dirty={session.processDirty} />}
          icon={<BuildIcon />}
          iconPosition="start"
        />
        <Tab
          label={<TabLabel text="제품 관리" dirty={session.itemDirty} />}
          icon={<ExtensionIcon />}
          iconPosition="start"
        />
      </Tabs>

      <Box sx={{ mt: 2, minHeight: 0 }}>
        {session.tabIndex === 0 && <ProcessFlowProcessTab />}
        {session.tabIndex === 1 && <ProcessFlowItemTab />}
      </Box>
    </>
  );
}

function DetailDialogActions({
  requestClose,
  onSaveSuccess,
}: {
  requestClose: () => void;
  onSaveSuccess: (message: string, keepOpen: boolean) => void;
}) {
  const session = useDetailSessionContext();
  const process = useProcessDraftContext();
  const item = useItemDraftContext();
  const active = session.tabIndex === 0 ? process : item;
  const otherDirty = session.tabIndex === 0 ? item.dirty : process.dirty;
  const successMessage =
    session.tabIndex === 0
      ? '공정 저장이 완료되었습니다.'
      : '제품 저장이 완료되었습니다.';

  const handleSave = async () => {
    const saved = await active.save();
    if (!saved) return;
    onSaveSuccess(successMessage, otherDirty);
  };

  return (
    <DialogActions>
      <Button
        variant="contained"
        onClick={handleSave}
        disabled={!active.dirty || active.isSaving}
      >
        {active.isSaving ? '저장중...' : '저장'}
      </Button>
      <Button onClick={requestClose} disabled={session.isSaving}>
        닫기
      </Button>
    </DialogActions>
  );
}

function DetailDialogShell({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const session = useDetailSessionContext();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();
  const pendingSuccessToastRef = useRef<string | null>(null);

  const requestClose = () => {
    if (session.isSaving) return;
    if (session.hasDirtyChanges) {
      setConfirmOpen(true);
      return;
    }
    onClose();
  };

  const discardAndClose = () => {
    session.discardAll();
    setConfirmOpen(false);
    onClose();
  };

  const handleSaveSuccess = (message: string, keepOpen: boolean) => {
    if (keepOpen) {
      showToast({ message, severity: 'success' });
      return;
    }

    pendingSuccessToastRef.current = message;
    onClose();
  };

  const handleDialogExited = () => {
    const message = pendingSuccessToastRef.current;
    if (!message) return;

    pendingSuccessToastRef.current = null;
    showToast({ message, severity: 'success' });
  };

  return (
    <Dialog
      open={open}
      onClose={requestClose}
      maxWidth="xl"
      fullWidth
      slotProps={{
        transition: {
          onExited: handleDialogExited,
        },
      }}
    >
      <Backdrop
        open={session.isSaving}
        sx={{ position: 'absolute', zIndex: 2000, color: '#fff' }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <DialogTitle>공정흐름 상세 관리</DialogTitle>

      <DialogContent
        sx={{
          height: '650px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        dividers
      >
        <DetailDialogContent />
      </DialogContent>

      <DetailDialogActions
        requestClose={requestClose}
        onSaveSuccess={handleSaveSuccess}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="닫기 확인"
        message="저장하지 않은 변경이 있습니다. 변경을 버리고 닫으시겠습니까?"
        confirmText="닫기"
        cancelText="취소"
        onConfirm={discardAndClose}
        onClose={() => setConfirmOpen(false)}
      />
    </Dialog>
  );
}

export default function ProcessFlowDetailDialog({
  open,
  onClose,
  selectedFlow,
  initialTab,
}: Props) {
  const [providerKey, setProviderKey] = useState('');

  useEffect(() => {
    if (open) {
      setProviderKey(selectedFlow?.processFlowId || '');
    }
  }, [open, selectedFlow?.processFlowId]);

  if (!selectedFlow) {
    return null;
  }

  return (
    <ProcessFlowDetailProvider
      key={providerKey}
      open={open}
      processFlow={selectedFlow}
    >
      <InitialTabSync initialTab={initialTab} />
      <DetailDialogShell open={open} onClose={onClose} />
    </ProcessFlowDetailProvider>
  );
}

function InitialTabSync({ initialTab }: { initialTab: number }) {
  const { setTabIndex } = useDetailSessionContext();

  useEffect(() => {
    setTabIndex(initialTab === 1 ? 1 : 0);
  }, [initialTab, setTabIndex]);

  return null;
}
