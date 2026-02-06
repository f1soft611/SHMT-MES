import {useMemo, useState} from "react";
import {GridRowId, GridRowSelectionModel} from "@mui/x-data-grid";
import {useToast} from "../../../components/common/Feedback/ToastProvider";
import {ProdPlanRow} from "../../../types/productionOrder";

export function useSameFlagSelection(
    rows: ProdPlanRow[],
    getRowId: (row: ProdPlanRow) => GridRowId
){

    const { showToast } = useToast();

    const [selectionModel, setSelectionModel] =
        useState<GridRowSelectionModel>({
            type: 'include',
            ids: new Set<GridRowId>(),
        });
    const [orderFlag, setOrderFlag] = useState<string | null>(null);


    const onSelectionChange = (model: GridRowSelectionModel) => {
        console.log(model.type)
        console.log(model)
        // 전체선택시
        if (model.type === 'exclude') {
            // 전체 해제
            if (model.ids.size > 0) {
                setSelectionModel({
                    type: 'include',
                    ids: new Set(),
                });
                setOrderFlag(null);
                return;
            }

            // 전체 선택 (ids 비어있음)
            if (rows.length === 0) return;

            const baseFlag = rows[0].orderFlag;
            const hasDifferentFlag = rows.some(r => r.orderFlag !== baseFlag);

            const allowedIds = rows
            .filter(r => r.orderFlag === baseFlag)
            .map(r => getRowId(r));

            console.log(allowedIds)

            if (hasDifferentFlag){
                showToast({
                    message: '지시상태가 같은 항목만 선택할 수 있습니다.',
                    severity: 'warning',
                });
            }



            setOrderFlag(baseFlag);
            setSelectionModel({
                type: 'include',
                ids: new Set(allowedIds),
            });

            console.log(selectionModel)
            return;
        }



        const nextIds = Array.from(model.ids);

        // 전체 해제
        if (nextIds.length ===0){
            setSelectionModel(model);
            setOrderFlag(null);
            return;
        }

        // 새로 선택된 row
        const addedId = nextIds.find(id => !selectionModel.ids.has(id));

        // 체크 해제만 한 경우
        if (!addedId) {
            setSelectionModel(model);
            return;
        }

        const addedRow = rows.find(r => getRowId(r) === addedId);
        if (!addedRow) return;

        // 첫 선택
        if (!orderFlag) {
            setOrderFlag(addedRow.orderFlag);
            setSelectionModel(model);
            return;
        }

        // 다른 지시상태
        if (addedRow.orderFlag !== orderFlag) {
            showToast({
                message: "지시상태가 같은 항목만 선택할 수 있습니다.",
                severity: "warning",
            });
            return;
        }

        setSelectionModel(model);
    }

    // 선택된 row 실제 데이터
    const selectedRows = useMemo(
        () => rows.filter(r =>  selectionModel.ids.has(getRowId(r))),
        [rows, selectionModel, getRowId]
    );

    return {
        selectionModel,
        selectedRows,
        orderFlag,
        onSelectionChange,
        clear: () => {
            setSelectionModel({
                type: 'include',
                ids: new Set(),
            });
            setOrderFlag(null);
        },
    };
}