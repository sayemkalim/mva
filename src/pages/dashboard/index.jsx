import NavbarItem from "@/components/navbar/navbar_item";
import AnalyticsCards from "./components/AnalyticsCards";
import DashboardCharts from "./components/DashboardCharts";
import { Navbar2 } from "@/components/navbar2";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-4">
      <Navbar2 />
      <NavbarItem title="Dashboard" />
      <AnalyticsCards />
    </div>
  );
};

export default Dashboard;
