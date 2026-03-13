import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Pencil, Trash2, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Navbar2 } from "@/components/navbar2";
import NavbarItem from "@/components/navbar/navbar_item";
import CustomTable from "@/components/custom_table";
import { CustomDialog } from "@/components/custom_dialog";
import Billing from "@/components/billing";
import ActionMenu from "@/components/action_menu";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

// ── helpers ────────────────────────────────────────────────────────────
const formatSeconds = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h > 0 ? `${h}h` : null, m > 0 ? `${m}m` : null, `${s}s`]
    .filter(Boolean)
    .join(" ");
};

const statusColors = {
  running: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
};

// ── component ──────────────────────────────────────────────────────────────
const TimerList = () => {
  const { slug } = useParams();
  const queryClient = useQueryClient();

  // ── state ──────────────────────────────────────────────────────────────
  const [editRow, setEditRow] = useState(null);      // row being edited
  const [deleteRow, setDeleteRow] = useState(null);  // row pending deletion
  const [timecardRow, setTimecardRow] = useState(null); // row pending timecard add
  const [editForm, setEditForm] = useState({
    task: "",
    description: "",
    billing_status_id: "",
    timekeeper_id: "",
  });

  // ── queries ────────────────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ["activityList", slug],
    queryFn: async () => {
      const res = await apiService({
        endpoint: `${endpoints.activityList}/${slug}`,
        method: "GET",
      });
      return res?.response ?? {};
    },
    enabled: !!slug,
  });

  const { data: metaData, isLoading: isLoadingMeta } = useQuery({
    queryKey: ["activityMeta"],
    queryFn: async () => {
      const res = await apiService({ endpoint: endpoints.activityMeta, method: "GET" });
      return res?.response ?? {};
    },
    staleTime: 300000,
    enabled: !!editRow,
  });

  const billingStatuses =
    metaData?.accounting_billing_status ??
    [];

  const timekeepers =
    metaData?.TimeKeeper ??
    [];

  // ── mutations ──────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      apiService({
        endpoint: `${endpoints.activityUpdate}/${id}`,
        method: "PUT",
        data,
      }),
    onSuccess: (res) => {
      if (res?.error) {
        toast.error(res?.response?.message || "Failed to update record");
        return;
      }
      toast.success("Timer record updated successfully");
      queryClient.invalidateQueries(["activityList", slug]);
      setEditRow(null);
    },
    onError: () => toast.error("Failed to update record"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      apiService({
        endpoint: `${endpoints.activityDelete}/${id}`,
        method: "DELETE",
      }),
    onSuccess: (res) => {
      if (res?.error) {
        toast.error(res?.response?.message || "Failed to delete record");
        return;
      }
      toast.success("Timer record deleted successfully");
      queryClient.invalidateQueries(["activityList", slug]);
      setDeleteRow(null);
    },
    onError: () => toast.error("Failed to delete record"),
  });

  const timecardMutation = useMutation({
    mutationFn: (id) =>
      apiService({
        endpoint: `${endpoints.activityTimecard}/${id}`,
        method: "POST",
      }),
    onSuccess: (res) => {
      if (res?.error) {
        toast.error(res?.response?.message || "Failed to add to timecard");
        return;
      }
      toast.success("Successfully added to timecard");
      queryClient.invalidateQueries(["activityList", slug]);
      setTimecardRow(null);
    },
    onError: () => toast.error("Failed to add to timecard"),
  });

  // ── handlers ───────────────────────────────────────────────────────────
  const openEdit = (row) => {
    setEditForm({
      task: row.task ?? "",
      description: row.description ?? "",
      billing_status_id: row.billing_status?.id ? String(row.billing_status.id) : "",
      timekeeper_id: row.timekeeper?.id ? String(row.timekeeper.id) : "",
    });
    setEditRow(row);
  };

  const onConfirmEdit = () => {
    updateMutation.mutate({
      id: editRow.id,
      data: {
        task: editForm.task,
        description: editForm.description,
        billing_status_id: editForm.billing_status_id
          ? Number(editForm.billing_status_id)
          : undefined,
        timekeeper_id: editForm.timekeeper_id
          ? Number(editForm.timekeeper_id)
          : undefined,
      },
    });
  };

  // ── columns ────────────────────────────────────────────────────────────
  const columns = [
    { key: "id", label: "#" },
    { key: "task", label: "Task", render: (val) => val || "—" },
    { key: "description", label: "Description", render: (val) => val || "—" },
    {
      key: "total_seconds",
      label: "Duration",
      render: (val) => formatSeconds(val ?? 0),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <Badge className={statusColors[val] ?? ""}>{val}</Badge>
      ),
    },
    {
      key: "billing_status",
      label: "Billing Status",
      render: (val) => val?.name || "—",
    },
    {
      key: "timekeeper",
      label: "Timekeeper",
      render: (val) => val?.name || "—",
    },
    { key: "created_by", label: "Created By" },
    {
      key: "created_at",
      label: "Created At",
      render: (val) => (val ? new Date(val).toLocaleString() : "—"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <ActionMenu
          options={[
            {
              label: "Edit",
              icon: Pencil,
              action: row.is_editable ? () => openEdit(row) : undefined,
              className: row.is_editable
                ? ""
                : "opacity-40 cursor-not-allowed pointer-events-none",
            },
            {
              label: "Delete",
              icon: Trash2,
              action: row.is_deletable ? () => setDeleteRow(row) : undefined,
              className: row.is_deletable
                ? "text-red-600 hover:text-red-700"
                : "opacity-40 cursor-not-allowed pointer-events-none text-red-400",
            },
            {
              label: "Add to Timecard",
              icon: Clock,
              action: () => setTimecardRow(row),
              className: "text-blue-600 hover:text-blue-700",
            },
          ]}
        />
      ),
    },
  ];

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const breadcrumbs = [{ title: "Timer List", isNavigation: false }];

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full">
      <Navbar2 />
      <Billing />
      <NavbarItem title="Timer List" breadcrumbs={breadcrumbs} />

      <div className="px-4 py-4">
        <CustomTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          error={error}
          emptyStateMessage="No timer records found."
          totalPages={pagination?.last_page}
          currentPage={pagination?.current_page}
          perPage={pagination?.per_page}
        />
      </div>

      {/* ── Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!editRow} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Timer Record</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Task</Label>
              <Input
                placeholder="Enter task name"
                value={editForm.task}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, task: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                rows={3}
                placeholder="Enter description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Billing Status</Label>
              {isLoadingMeta ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : (
                <Select
                  value={editForm.billing_status_id}
                  onValueChange={(val) =>
                    setEditForm((p) => ({ ...p, billing_status_id: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select billing status" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingStatuses.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1">
              <Label>Timekeeper</Label>
              {isLoadingMeta ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : (
                <Select
                  value={editForm.timekeeper_id}
                  onValueChange={(val) =>
                    setEditForm((p) => ({ ...p, timekeeper_id: val }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timekeeper" />
                  </SelectTrigger>
                  <SelectContent>
                    {timekeepers.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditRow(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={onConfirmEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ─────────────────────────────────────── */}
      <CustomDialog
        onOpen={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        title={`Timer Record #${deleteRow?.id}`}
        modalType="Delete"
        onDelete={() => deleteMutation.mutate(deleteRow.id)}
        isLoading={deleteMutation.isPending}
      />

      {/* ── Add to Timecard Confirmation ────────────────────────────── */}
      <Dialog open={!!timecardRow} onOpenChange={(open) => !open && setTimecardRow(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Timecard</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to add Timer Record{" "}
            <span className="font-medium text-foreground">#{timecardRow?.id}</span> to the
            timecard?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTimecardRow(null)}
              disabled={timecardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => timecardMutation.mutate(timecardRow.id)}
              disabled={timecardMutation.isPending}
            >
              {timecardMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimerList;

