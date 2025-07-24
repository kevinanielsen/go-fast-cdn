import MainContentWrapper from "@/components/layouts/main-content-wrapper";
import useGetDashboard from "../hooks/use-get-dashboard";
import InfoCard from "../info-card";

const DashboardPage = () => {
  const { data: dashboardData } = useGetDashboard();

  const formatSize = (size: number) => {
    if (size < 1000) return `${size} b`;
    if (size < 1_000_000) return `${(size / 1000).toFixed(1)} KB`;
    if (size < 1_000_000_000) return `${(size / 1_000_000).toFixed(1)} MB`;
    if (size < 1_000_000_000_000)
      return `${(size / 1_000_000_000).toFixed(1)} GB`;
    return `${(size / 1_000_000_000_000).toFixed(1)} TB`;
  };

  return (
    <MainContentWrapper title="Dashboard" className="gap-4 flex flex-col">
      <div className="grid grid-cols-3 gap-4">
        <InfoCard
          title="Total 2FA Enabled Users"
          value={dashboardData?.security.users_with_2fa || 0}
        />
        <InfoCard
          title="Total Verified Users"
          value={dashboardData?.users.verified || 0}
        />
        <InfoCard
          title="Total Admins"
          value={dashboardData?.users.admins || 0}
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <InfoCard title="Total Users" value={dashboardData?.users.total || 0} />
        <InfoCard
          title="Total File Size"
          value={formatSize(dashboardData?.files.total_size_bytes || 0)}
        />
        <InfoCard
          title="Total Document"
          value={dashboardData?.files.documents_count || 0}
        />
        <InfoCard
          title="Total Image"
          value={dashboardData?.files.images_count || 0}
        />
      </div>
    </MainContentWrapper>
  );
};

export default DashboardPage;
