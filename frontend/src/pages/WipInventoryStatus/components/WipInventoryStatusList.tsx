import React from "react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { WipInventoryRow } from "../../../types/productionWipInventory";

interface Props {
  rows: WipInventoryRow[];
  rowCount: number;
  loading: boolean;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

const columns: GridColDef[] = [
  {
    field: "lotNo",
    headerName: "제품LOT No",
    width: 200,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "prodItemCode",
    headerName: "공정품목코드",
    width: 150,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "prodItemName",
    headerName: "공정품목명",
    width: 200,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "prodItemSpec",
    headerName: "공정품목규격",
    width: 200,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "workName",
    headerName: "공정",
    width: 150,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "wipQty",
    headerName: "재고량",
    width: 150,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "processFlow",
    headerName: "공정흐름",
    minWidth: 400,
    headerAlign: "center",
    align: "left",
  },
];

const WipInventoryStatusList = ({
  rows,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
}: Props) => {
  return (
    <>
      <Card
        sx={{
          boxShadow: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardContent sx={{ p: 0, position: "relative", flex: 1, minHeight: 0 }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                backgroundColor: "rgba(255,255,255,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={48} />
            </Box>
          )}

          <Box sx={{ height: "100%", minHeight: 420 }}>
            <DataGrid
              columns={columns}
              rows={rows}
              rowCount={rowCount}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={onPaginationModelChange}
              pageSizeOptions={[20, 50, 100]}
              getRowId={(row) =>
                `${row.factoryCode}_${row.prodplanDate}_${row.prodplanSeq}_${row.prodworkSeq}_${row.workSeq}`
              }
              rowHeight={30}
              columnHeaderHeight={35}
              sx={{
                fontSize: 12.5,
                border: "none",
                "& .MuiDataGrid-cell": {
                  padding: "0 2px",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "background.paper",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                },
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            />
          </Box>
        </CardContent>
        <CardActions sx={{ display: "none" }} />
      </Card>
    </>
  );
};

export default WipInventoryStatusList;
