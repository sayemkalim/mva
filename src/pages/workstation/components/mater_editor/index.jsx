import React from "react";
import { useQuery } from "@tanstack/react-query";
import NavbarItem from "@/components/navbar/navbar_item";
import AddMatterCard from "./AddMatterCard";
import { fetchMatterMetadata } from "../../helpers/fetchMatterMetadata";

const MatterEditor = () => {
  // Fetch matter metadata (dropdown options)
  const {
    data: metadataRes,
    isLoading: isMetadataLoading,
    error: metadataError,
  } = useQuery({
    queryKey: ["matterMetadata"],
    queryFn: fetchMatterMetadata,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
  });

  const metadata = metadataRes?.response || metadataRes;

  const breadcrumbs = [
    { title: "Matters", isNavigation: true, path: "/dashboard/workstation" },
    { title: "Add Matter", isNavigation: false },
  ];

  return (
    <div className="flex flex-col gap-2">
      <NavbarItem title="Add Matter" breadcrumbs={breadcrumbs} />
      <div className="px-8 pb-8">
        {isMetadataLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <span className="text-gray-600">Loading form data...</span>
            </div>
          </div>
        ) : metadataError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">
              Failed to load form metadata. Please try again.
            </p>
            <p className="text-sm text-red-500 mt-2">
              Error: {metadataError.message}
            </p>
          </div>
        ) : !metadata?.Apistatus ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700 font-medium">
              Form metadata not available. Please refresh the page.
            </p>
          </div>
        ) : (
          <AddMatterCard metadata={metadata} />
        )}
      </div>
    </div>
  );
};

export default MatterEditor;
