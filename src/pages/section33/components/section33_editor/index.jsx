import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import NavbarItem from "@/components/navbar/navbar_item";
import AddMatterCard from "./AddMatterCard";
import { fetchMatterMetadata } from "../../helpers/fetchMatterMetadata";
import { fetchMatterBySlug } from "../../helpers/fetchMatterBySlug";

const MatterEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!slug;
  const {
    data: metadataRes,
    isLoading: isMetadataLoading,
    error: metadataError,
  } = useQuery({
    queryKey: ["matterMetadata"],
    queryFn: fetchMatterMetadata,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
  const {
    data: matterData,
    isLoading: isMatterLoading,
    error: matterError,
  } = useQuery({
    queryKey: ["matter", slug],
    queryFn: () => {
      if (!slug) {
        return Promise.reject(new Error("Slug is required"));
      }
      return fetchMatterBySlug(slug);
    },
    enabled: isEditMode && !!slug,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    onError: (error) => {
      console.error("Matter fetch error:", error);
    },
  });

  const metadata = metadataRes?.response || metadataRes;
  const existingMatter = matterData?.response || matterData;

  const breadcrumbs = [
    { title: "Matters", isNavigation: true, path: "/dashboard/workstations" },
    { title: isEditMode ? "Initial Info " : "Add Matter", isNavigation: false },
  ];

  const isLoading = isMetadataLoading || (isEditMode && isMatterLoading);
  const error = metadataError || matterError;

  return (
    <div className="flex flex-col gap-2">
      {/* <NavbarItem
        title={isEditMode ? "Initial Info" : "Add Matter"}
        breadcrumbs={breadcrumbs}
      /> */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <span className="text-gray-600">
                {isMetadataLoading
                  ? "Loading form data..."
                  : "Loading matter details..."}
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium mb-2">
              {metadataError
                ? "Failed to load form metadata."
                : "Failed to load matter details."}
            </p>
            <p className="text-sm text-red-500 mb-4">Error: {error.message}</p>
            <button
              onClick={() => navigate("/dashboard/workstation")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Go Back to Workstation
            </button>
          </div>
        ) : !metadata?.Apistatus ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700 font-medium">
              Form metadata not available. Please refresh the page.
            </p>
          </div>
        ) : (
          <AddMatterCard
            metadata={metadata}
            initialData={existingMatter}
            isEditMode={isEditMode}
          />
        )}
      </div>
    </div>
  );
};

export default MatterEditor;
