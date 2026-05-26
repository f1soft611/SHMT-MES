import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Typography,
} from '@mui/material';
import { ProdPlanRow } from '../../../types/productionOrder';
import {decodeHtml} from "../../../utils/stringUtils";

interface StopWorkDialogProps {
  open: boolean;
  row: ProdPlanRow | null;
  orderQty: number;
  isLoading: boolean;
  onOrderQtyChange: (v: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}

const formatDate = (d: string): string =>
  d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d;

const StopWorkDialog = ({
                                                  open,
                                                  row,
                                                  orderQty,
                                                  isLoading,
                                                  onOrderQtyChange,
                                                  onClose,
                                                  onConfirm,
                                                }: StopWorkDialogProps) => {
  const infoRows = [
    { label: '품목명',  value: decodeHtml(row?.itemName) ?? '' },
    { label: '생산일자', value: row ? formatDate(row.prodplanDate) : '' },
    { label: '작업장',  value: row?.workcenterName ?? '' },
    { label: '계획수량', value: row?.prodQty != null ? String(row.prodQty) : '' },
  ];

  return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>작업 중단</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
            {infoRows.map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography
                      variant="body2"
                      sx={{ width: 64, color: 'text.secondary', flexShrink: 0 }}
                  >
                    {label}
                  </Typography>
                  <Typography variant="body2">{value}</Typography>
                </Box>
            ))}

            <TextField
                label="변경수량"
                type="number"
                size="small"
                fullWidth
                value={orderQty}
                onChange={(e) => onOrderQtyChange(Number(e.target.value))}
                inputProps={{ min: 1 }}
                sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>취소</Button>
          <Button onClick={onConfirm} variant="contained" disabled={isLoading}>
            {isLoading ? '처리 중...' : '확인'}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default StopWorkDialog;
