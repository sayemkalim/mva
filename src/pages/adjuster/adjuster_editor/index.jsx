import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getABMeta } from "../helpers/fetchABMeta";
import { fetchAdjusterBySlug } from "../helpers/fetchAdjusterBySlug";
import { createAdjuster } from "../helpers/createAdjuster";
import { deleteAdjuster } from "../helpers/deleteAdjuster";
import { Navbar2 } from "@/components/navbar2";
import { formatPhoneNumber } from "@/lib/utils";

export default function Adjuster() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch metadata
  const {
    data: apiResponse,
    isLoading: isLoadingMetadata,
    error: metadataError,
    isError: isMetadataError,
  } = useQuery({
    queryKey: ["adjusterMeta"],
    queryFn: getABMeta,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const metadata = apiResponse?.response || {};

  // Fetch adjuster data by slug (for edit mode)
  const { data: adjusterData, isLoading: isLoadingAdjuster } = useQuery({
    queryKey: ["adjuster", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const data = await fetchAdjusterBySlug(slug);
        return data;
      } catch (error) {
        if (
          error.message?.includes("404") ||
          error.message?.includes("not found")
        ) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Create mutation for saving adjusters
  const createMutation = useMutation({
    mutationFn: createAdjuster,
    onSuccess: (apiResponse) => {
      if (apiResponse?.response?.Apistatus) {
        toast.success("Adjuster information saved successfully!");
        // navigate(`/dashboard/workstation/edit/${slug}/next-page`);
      }
    },
    onError: (error) => {
      toast.error("Failed to save information. Please try again.");
    },
  });

  // Delete mutation for deleting adjusters
  const deleteMutation = useMutation({
    mutationFn: async (id) => deleteAdjuster(id),
    onSuccess: (data, id) => {
      setAdjusters((prev) => prev.filter((adj) => adj.id !== id));
      toast.success("Adjuster deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete adjuster. Please try again.");
    },
  });

  // Adjusters state
  const [adjusters, setAdjusters] = useState([
    {
      id: null,
      current: true,
      insurance_company: "",
      first_name: "",
      last_name: "",
      claim_no: "",
      policy_no: "",
      toll_free_no: "",
      telephone: "",
      ext: "",
      fax: "",
      email: "",
      note: "",
    },
  ]);

  // Check for valid slug
  useEffect(() => {
    if (!slug) {
      toast.error("Invalid URL - Slug not found!");
      navigate("/dashboard/workstation");
    }
  }, [slug, navigate]);

  // Populate form when data is loaded
  useEffect(() => {
    if (
      adjusterData &&
      Array.isArray(adjusterData) &&
      adjusterData.length > 0
    ) {
      setAdjusters(adjusterData);
    }
  }, [adjusterData]);

  const handleChange = (index, field, value) => {
    setAdjusters((prev) =>
      prev.map((adjuster, i) =>
        i === index ? { ...adjuster, [field]: value } : adjuster
      )
    );
  };

  const handleCurrentToggle = (index, checked) => {
    setAdjusters((prev) =>
      prev.map((adjuster, i) => ({
        ...adjuster,
        current: i === index ? checked : false,
      }))
    );
  };

  const addAdjuster = () => {
    setAdjusters((prev) => [
      ...prev,
      {
        id: null,
        current: false,
        insurance_company: "",
        first_name: "",
        last_name: "",
        claim_no: "",
        policy_no: "",
        toll_free_no: "",
        telephone: "",
        ext: "",
        fax: "",
        email: "",
        note: "",
      },
    ]);
  };

  const removeAdjuster = (index) => {
    const adjuster = adjusters[index];

    // Remove from state if no id exists
    if (!adjuster.id) {
      if (adjusters.length === 1) {
        toast.error("At least one adjuster is required!");
        return;
      }
      setAdjusters((prev) => prev.filter((_, i) => i !== index));
      toast.success("Adjuster removed");
      return;
    }

    // Otherwise, call delete API
    deleteMutation.mutate(adjuster.id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentCount = adjusters.filter((adj) => adj.current).length;
    if (currentCount === 0) {
      toast.error("Please mark at least one adjuster as current");
      return;
    }
    if (currentCount > 1) {
      toast.error("Only one adjuster can be marked as current");
      return;
    }
    const payload = adjusters
      .filter(
        (adjuster) =>
          adjuster.insurance_company ||
          adjuster.first_name ||
          adjuster.last_name
      )
      .map((adjuster) => ({
        ...(adjuster.id && { id: adjuster.id }),
        current: adjuster.current,
        insurance_company: adjuster.insurance_company || null,
        first_name: adjuster.first_name || null,
        last_name: adjuster.last_name || null,
        claim_no: adjuster.claim_no || null,
        policy_no: adjuster.policy_no || null,
        toll_free_no: adjuster.toll_free_no || null,
        telephone: adjuster.telephone || null,
        ext: adjuster.ext || null,
        fax: adjuster.fax || null,
        email: adjuster.email || null,
        note: adjuster.note || null,
      }));

    createMutation.mutate({
      slug: slug,
      data: payload,
    });
  };

  if (isLoadingMetadata || isLoadingAdjuster) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading form data...</span>
      </div>
    );
  }

  if (isMetadataError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-500 text-xl font-semibold">
          Error loading form
        </div>
        <p className="text-muted-foreground">
          {metadataError?.message || "Invalid response from server"}
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => queryClient.invalidateQueries(["adjusterMeta"])}
          >
            Retry
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/workstation")}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar2 />
      <div className="bg-card border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm">
          <span className="text-foreground">
            Unpaid: <span className="font-semibold">$ 0</span>
          </span>
          <span className="text-foreground">
            Unbilled: <span className="font-semibold">$ 0</span>
          </span>
          <span className="text-foreground">
            Client Funds-Operating: <span className="font-semibold">$ 0</span>
          </span>
          <span className="text-foreground">
            Client Funds-Trust: <span className="font-semibold">$ 0</span>
          </span>
        </div>
      </div>

      <div className="bg-card border-b px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-foreground transition"
          >
            Dashboard
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate("/dashboard/workstation")}
            className="hover:text-foreground transition"
          >
            Workstation
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Adjuster</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-card rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-foreground uppercase">
              Adjuster Information
            </h1>
            <Button
              type="button"
              onClick={addAdjuster}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Adjuster
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {adjusters.map((adjuster, index) => (
              <div
                key={index}
                className="border border-gray-200 p-6 rounded-lg space-y-6 bg-muted"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-foreground text-lg">
                      Adjuster {index + 1}
                    </h3>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`current-${index}`}
                        checked={adjuster.current}
                        onCheckedChange={(checked) =>
                          handleCurrentToggle(index, checked)
                        }
                      />
                      <Label
                        htmlFor={`current-${index}`}
                        className={`cursor-pointer font-medium ${adjuster.current ? "text-green-600" : "text-muted-foreground"
                          }`}
                      >
                        {adjuster.current ? "✓ Current" : "Set as Current"}
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => removeAdjuster(index)}
                    variant="destructive"
                    size="sm"
                    disabled={adjusters.length === 1 && !adjuster.id}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {adjuster.id ? "Delete" : "Remove"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Insurance Company
                    </Label>
                    <Input
                      value={adjuster.insurance_company}
                      onChange={(e) =>
                        handleChange(index, "insurance_company", e.target.value)
                      }
                      placeholder="ABC Insurance"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      First Name
                    </Label>
                    <Input
                      value={adjuster.first_name}
                      onChange={(e) =>
                        handleChange(index, "first_name", e.target.value)
                      }
                      placeholder="John"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Last Name
                    </Label>
                    <Input
                      value={adjuster.last_name}
                      onChange={(e) =>
                        handleChange(index, "last_name", e.target.value)
                      }
                      placeholder="Doe"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Claim Number
                    </Label>
                    <Input
                      value={adjuster.claim_no}
                      onChange={(e) =>
                        handleChange(index, "claim_no", e.target.value)
                      }
                      placeholder="CLM-12345"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Policy Number
                    </Label>
                    <Input
                      value={adjuster.policy_no}
                      onChange={(e) =>
                        handleChange(index, "policy_no", e.target.value)
                      }
                      placeholder="POL-99991"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Toll Free Number
                    </Label>
                    <Input
                      value={adjuster.toll_free_no}
                      onChange={(e) =>
                        handleChange(index, "toll_free_no", formatPhoneNumber(e.target.value))
                      }
                      placeholder="(888) 888-8888"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Telephone
                    </Label>
                    <Input
                      value={adjuster.telephone}
                      onChange={(e) =>
                        handleChange(index, "telephone", formatPhoneNumber(e.target.value))
                      }
                      placeholder="(888) 888-8888"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">
                      Extension
                    </Label>
                    <Input
                      value={adjuster.ext}
                      onChange={(e) =>
                        handleChange(index, "ext", e.target.value)
                      }
                      placeholder="101"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Fax</Label>
                    <Input
                      value={adjuster.fax}
                      onChange={(e) =>
                        handleChange(index, "fax", formatPhoneNumber(e.target.value))
                      }
                      placeholder="(888) 888-8888"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground font-medium">Email</Label>
                    <Input
                      type="email"
                      value={adjuster.email}
                      onChange={(e) =>
                        handleChange(index, "email", e.target.value)
                      }
                      placeholder="john@example.com"
                      className="h-9 bg-card border-input"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-3">
                    <Label className="text-foreground font-medium">Note</Label>
                    <Textarea
                      value={adjuster.note}
                      onChange={(e) =>
                        handleChange(index, "note", e.target.value)
                      }
                      placeholder="Primary adjuster"
                      rows={3}
                      className="bg-card border-input"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dashboard/workstation/edit/${slug}`)}
                disabled={createMutation.isPending}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                size="lg"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Continue"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
