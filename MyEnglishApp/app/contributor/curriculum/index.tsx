import { AdminCurriculumWorkspace } from '@/components/admin/AdminCurriculumWorkspace';
import { contributorCurriculumService } from '@/services/adminCurriculumService';

export default function ContributorCurriculumScreen() {
  return <AdminCurriculumWorkspace service={contributorCurriculumService} role="CONTRIBUTOR" />;
}
