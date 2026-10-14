import { useRouter } from 'expo-router';
import { CommonTaskCatalogScreen } from '../../../features/task-breakdown/CommonTaskCatalogScreen';
export default function CommonTasksRoute() {
  const router = useRouter();
  return <CommonTaskCatalogScreen onClose={() => router.replace('/tasks/templates')}
    onUse={id => router.push({ pathname: '/tasks/catalog/new/[id]', params: { id } })} />;
}
