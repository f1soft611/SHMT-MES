import {useState} from "react";

export function useProcessFlowDetail(){
    const [flowProcessRows, setFlowProcessRows] = useState([]);
    const [flowItemRows, setFlowItemRows] = useState([]);

    const [processRows, setProcessRows] = useState([]);
    const [itemRows, setItemRows] = useState([]);

    return {
        // 목록
        flowProcessRows,
        flowItemRows,
        processRows,
        itemRows,
    };
}