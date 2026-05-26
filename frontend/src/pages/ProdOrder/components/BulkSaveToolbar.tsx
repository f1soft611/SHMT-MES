import { GridToolbarContainer } from "@mui/x-data-grid";
import { Box, Button } from "@mui/material";
import {
    Save as SaveIcon,
    Delete as DeleteIcon,
    Stop as StopIcon,
} from "@mui/icons-material";

interface Props {
    onBulkOrder: () => void;
    onBulkCancel: () => void;
    selectedCount?: number;
    canStop?: boolean;
    onStopWork?: () => void;
}

const BulkSaveToolbar = ({ onBulkOrder, onBulkCancel, selectedCount = 0, canStop = false, onStopWork }: Props) => {
    return (
        <GridToolbarContainer
            sx={{
                px: 1.5,
                py: 0.75,
                borderBottom: "1px solid #e0e0e0",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <Box sx={{ fontSize: 16, fontWeight: 600 }}>
                    생산계획 목록
                </Box>

                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                    <Button
                        startIcon={<StopIcon />}
                        variant="contained"
                        size="small"
                        color="warning"
                        disabled={!canStop}
                        onClick={onStopWork}
                    >
                        작업 중단
                    </Button>

                    <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        size="small"
                        disabled={selectedCount < 1}
                        onClick={onBulkOrder}
                    >
                        일괄 지시
                    </Button>

                    <Button
                        startIcon={<DeleteIcon />}
                        variant="contained"
                        size="small"
                        color="error"
                        disabled={selectedCount < 1}
                        onClick={onBulkCancel}
                    >
                        일괄 취소
                    </Button>
                </Box>
            </Box>
        </GridToolbarContainer>
    );
};

export default BulkSaveToolbar;