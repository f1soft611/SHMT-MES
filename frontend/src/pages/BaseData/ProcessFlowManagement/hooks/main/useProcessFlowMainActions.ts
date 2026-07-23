import { ProcessFlow } from '../../../../../types/processFlow';
import { useToast } from '../../../../../components/common/Feedback/ToastProvider';
import { useProcessFlowMasterMutations } from '../useProcessFlowMasterMutations';

export function useProcessFlowMainActions(closeDialog: () => void) {
  const { showToast } = useToast();
  const mutations = useProcessFlowMasterMutations();

  const handleSave = async (data: ProcessFlow, mode: 'create' | 'edit') => {
    try {
      if (mode === 'create') {
        await mutations.create.mutateAsync(data);
      } else {
        if (!data.processFlowId) throw new Error('processFlowId 없음');
        await mutations.update.mutateAsync({
          id: data.processFlowId,
          data,
        });
      }
      showToast({ message: '저장 성공', severity: 'success' });
      closeDialog();
      return true;
    } catch (e: any) {
      showToast({ message: e.message, severity: 'error' });
      console.error(e);
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return false;

    try {
      await mutations.remove.mutateAsync(id);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { handleSave, handleDelete };
}
