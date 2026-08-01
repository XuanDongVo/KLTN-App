import { AdminCurriculumWorkspace } from '@/components/admin/AdminCurriculumWorkspace';
import { adminCurriculumService } from '@/services/adminCurriculumService';

export default function CurriculumScreen() {
  return <AdminCurriculumWorkspace service={adminCurriculumService} role="ADMIN" />;
}
