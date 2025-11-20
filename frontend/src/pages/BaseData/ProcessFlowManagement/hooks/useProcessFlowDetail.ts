import {useEffect, useState} from "react";

interface FilterConfig<T> {
    // 검색 조건이 "0", "1" ... 으로 선택되었을 때 어떤 필드를 매핑할지
    fields: Record<string, (row: T) => string | undefined>;
}

export function useProcessFlowDetail<T>(rows: T[], config: FilterConfig<T>) {


    const [inputValues, setInputValues] = useState({
        searchCnd: "0",
        searchWrd: "",
    });

    const [filteredRows, setFilteredRows] = useState<T[]>(rows);

    // 원본 바뀌면 초기화
    useEffect(() => {
        setFilteredRows(rows);
    }, [rows]);

    const handleInputChange = (field: string, value: string) => {
        setInputValues(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = () => {
        const word = inputValues.searchWrd.trim().toLowerCase();
        if (!word) {
            setFilteredRows(rows);
            return;
        }

        const extractor = config.fields[inputValues.searchCnd];
        if (!extractor) {
            setFilteredRows(rows);
            return;
        }

        const result = rows.filter(row => {
            const target = extractor(row);
            return target?.toLowerCase().includes(word);
        });

        setFilteredRows(result);
    };

    return {
        inputValues,
        handleInputChange,
        handleSearch,
        filteredRows,
    };
}