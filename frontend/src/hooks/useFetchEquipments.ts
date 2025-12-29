import {useEffect, useState} from "react";
import {EquipmentInfo} from "../types/equipment";
import equipmentService from "../services/equipmentService";

export function useFetchEquipments(workplaceId: string){
    const [equipments, setEquipments] = useState<EquipmentInfo[]>([]);

    const fetchEquipments = async () => {
        try {
            const response = await equipmentService.getEquipmentsByWorkplaceId(workplaceId)
            if (response.resultCode === 200 && response.result?.resultList) {
                setEquipments(response.result.resultList);
            }
        } catch (err: any) {
            console.error('Failed to load equipments:', err);
            setEquipments([]);
        }
    };

    useEffect(() => {
        if (!workplaceId) {
            setEquipments([]);
            return;
        }
        fetchEquipments();
    }, [workplaceId]);

    return {
        equipments,
        refetchEquips: fetchEquipments,
    };
}