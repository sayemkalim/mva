import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FolderOpen,
  CheckCircle,
  UserX,
  AlertCircle,
  Calendar,
  Clock,
  CheckSquare,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "../helpers/fetchDashboard";

const AnalyticsCards = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        {[1, 2].map((i) => (
          <Card key={i} className="py-2 shadow-md border animate-pulse">
            <CardHeader className="h-30 bg-gray-200 rounded" />
            <CardContent className="h-36 bg-gray-100 rounded mt-2" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 text-red-500">
        Error loading dashboard: {error.message}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
      {/* Cases Card */}
      <Card className="shadow-md border">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3">
          <CardTitle className="text-base font-semibold">
            Cases Overview
          </CardTitle>
          <FolderOpen className="w-5 h-5 text-gray-500" />
        </CardHeader>
        <CardContent className="space-y-2 pt-2 pb-3">
          <CaseItem
            label="Active"
            value={data?.cases?.active || 0}
            icon={FolderOpen}
            color="text-blue-600"
          />
          <CaseItem
            label="Closed"
            value={data?.cases?.closed || 0}
            icon={CheckCircle}
            color="text-green-600"
          />
          <CaseItem
            label="Client Moved"
            value={data?.cases?.client_moved || 0}
            icon={UserX}
            color="text-orange-600"
          />
          <CaseItem
            label="Non Engagement Issued"
            value={data?.cases?.non_engagement_issued || 0}
            icon={AlertCircle}
            color="text-red-600"
          />
        </CardContent>
      </Card>

      {/* Tasks Card */}
      <Card className="shadow-md border">
        <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3">
          <CardTitle className="text-base font-semibold">
            Tasks Overview
          </CardTitle>
          <CheckSquare className="w-5 h-5 text-gray-500" />
        </CardHeader>
        <CardContent className="space-y-2 pt-2 pb-3">
          <TaskItem
            label="Today"
            value={data?.tasks?.today || 0}
            icon={Calendar}
            color="text-purple-600"
          />
          <TaskItem
            label="Pending"
            value={data?.tasks?.pending || 0}
            icon={Clock}
            color="text-yellow-600"
          />
          <TaskItem
            label="Incomplete"
            value={data?.tasks?.incomplete || 0}
            icon={XCircle}
            color="text-red-600"
          />
          <TaskItem
            label="Complete"
            value={data?.tasks?.complete || 0}
            icon={CheckSquare}
            color="text-green-600"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCards;
function CaseItem({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-base font-bold text-gray-900">{value}</span>
    </div>
  );
}
function TaskItem({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-base font-bold text-gray-900">{value}</span>
    </div>
  );
}
