import StudentDashboardLayout from "../components/StudentDashboardLayout";
import SolutionDashboardPage from "../components/SolutionDashboardPage";

export default function StudentSolutionsDashboardPageWrapper() {
  return (
    <StudentDashboardLayout pageTitle="solutions" activeNav="solutions">
      <SolutionDashboardPage />
    </StudentDashboardLayout>
  );
}
