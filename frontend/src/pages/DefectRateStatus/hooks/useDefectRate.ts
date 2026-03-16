import { useState } from "react";
import { GridPaginationModel } from '@mui/x-data-grid';
import {useToast} from "../../../components/common/Feedback/ToastProvider";
import {ProductionDefectRateRow, ProductionDefectRateSearchParams} from "../../../types/productionDefectRate";
import {useFetchWorkplaces} from "../../../hooks/useFetchWorkplaces";
import {useFetchEquipments} from "../../../hooks/useFetchEquipments";
import {productionDefectRateService} from "../../../services/productionDefectRateService";

export function useDefectRate() {
    const { showToast } = useToast();

    const today = new Date().toISOString().slice(0, 10);

    const dateTo = new Date();
    dateTo.setDate(dateTo.getDate() + 7);

    /** 검색조건 */
    const [search, setSearch] = useState<ProductionDefectRateSearchParams>({
        workplace: '',
        equipment: '',
        dateFrom: today,
        dateTo: dateTo.toISOString().slice(0, 10)
    });

    /** 페이징 */
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 20
    });

    /** 리스트 */
    const [rows, setRows] = useState<ProductionDefectRateRow[]>([]);
    const [rowCount, setRowCount] = useState(0);

    /** 로딩 */
    const [loading, setLoading] = useState(false);

    /** 검색조건 변경 */
    const onChange = (name: keyof ProductionDefectRateSearchParams, value: string) => {
        setSearch(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onSearch = async (model = paginationModel) => {
        try {
            setLoading(true);
            const params = {
                ...search,
                page: model.page,
                size: model.pageSize,
            };

            const response = await productionDefectRateService.getProdDefectRateList(params);
            setRows(response.result?.resultList ?? []);
            setRowCount(response.result.resultCnt ?? 0);
        } catch (err: any) {
            showToast({
                message: '목록 조회 실패',
                severity: 'error',
            });
            setRows([]);
            setRowCount(0);
        } finally {
            setLoading(false);
        }
    };

    const onPaginationChange = (model: GridPaginationModel) => {
        setPaginationModel(model);
        onSearch(model);
    };

    // 작업장 조회
    const workplaces = useFetchWorkplaces();
    //  작업장 코드 기준 설비 자동 조회
    const { equipments } = useFetchEquipments(search.workplace);

    return {
        rows,
        rowCount,
        loading,
        search,
        onChange,
        onSearch,
        workplaces: workplaces.workplaces,
        equipments,
        paginationModel,
        onPaginationChange
    };
}