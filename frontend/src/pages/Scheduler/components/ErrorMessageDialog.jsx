import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

/**
 * 에러 메시지 상세 보기 다이얼로그
 */
export const ErrorMessageDialog = ({
  open,
  onClose,
  errorMessage,
  errorStackTrace,
  schedulerName,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '400px',
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h6">에러 상세 정보</Typography>
          {schedulerName && (
            <Typography variant="caption" color="text.secondary">
              스케줄러: {schedulerName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* 에러 메시지 */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" color="error">
              에러 메시지
            </Typography>
            <Tooltip title={copySuccess ? '복사완료!' : '복사'}>
              <IconButton
                size="small"
                onClick={() => handleCopy(errorMessage)}
                color={copySuccess ? 'success' : 'default'}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              p: 2,
              bgcolor: '#fff5f5',
              borderRadius: 1,
              border: '1px solid #ffcdd2',
              maxHeight: '150px',
              overflow: 'auto',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                color: '#c62828',
              }}
            >
              {errorMessage || '에러 메시지가 없습니다.'}
            </Typography>
          </Box>
        </Box>

        {/* 스택 트레이스 */}
        {errorStackTrace && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                스택 트레이스
              </Typography>
              <Tooltip title={copySuccess ? '복사완료!' : '복사'}>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(errorStackTrace)}
                  color={copySuccess ? 'success' : 'default'}
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                border: '1px solid #e0e0e0',
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: '#424242',
                }}
              >
                {errorStackTrace}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions dividers>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * 에러 메시지 셀 렌더러
 */
export const ErrorMessageCell = ({ value, row }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!value) {
    return (
      <Box sx={{ textAlign: 'center', width: '100%', color: 'text.secondary' }}>
        -
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: 1,
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={value}
        >
          {value}
        </Box>
        <Tooltip title="상세 보기">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
            sx={{
              padding: '4px',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <SearchIcon fontSize="small" color="primary" />
          </IconButton>
        </Tooltip>
      </Box>

      <ErrorMessageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        errorMessage={value}
        errorStackTrace={row.errorStackTrace}
        schedulerName={row.schedulerName}
      />
    </>
  );
};

/**
 * 에러 메시지 컬럼 정의 (바로 사용 가능)
 */
export const errorMessageColumn = {
  field: 'errorMessage',
  headerName: '에러 메시지',
  flex: 1,
  minWidth: 250,
  headerAlign: 'center',
  renderCell: (params) => (
    <ErrorMessageCell value={params.value} row={params.row} />
  ),
};
