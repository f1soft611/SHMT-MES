import {useEffect, useState} from "react";
import {Equipment} from "../types/equipment";
import equipmentService from "../services/equipmentService";

export function useFetchEquipments(){
    const [equipments, setEquipments] = useState<Equipment[]>([]);

    const fetchEquipments = async () => {
        try {
            const response = await equipmentService.getEquipmentList(0, 99 )
            if (response.resultCode === 200 && response.result?.resultList) {
                setEquipments(response.result.resultList);
            }
        } catch (err: any) {
            console.error('Failed to load equipments:', err);
            setEquipments([]);
        }
    };

    useEffect(() => {
        fetchEquipments
    }, []);

    return{
        equipments,
        refetchEquips: fetchEquipments
    }
}