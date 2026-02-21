import { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Navbar2 } from "@/components/navbar2";
import NavbarItem from "@/components/navbar/navbar_item";
import Billing from "@/components/billing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import FolderTree from "./components/FolderTree";
import AddDocumentDialog from "./components/AddDocumentDialog";
import DocumentPreview from "./components/DocumentPreview";
import { fetchFolderList } from "./helpers/fetchFolderList";

const DocumentI = () => {
  const { slug } = useParams();
  const [searchText, setSearchText] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const debouncedSearch = useDebounce(searchText, 500);

  const breadcrumbs = [{ title: "Document-I", isNavigation: false }];

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["documenti-folders", slug, debouncedSearch],
    queryFn: () => fetchFolderList(slug, { search: debouncedSearch }),
    enabled: !!slug,
  });

  const folders = Array.isArray(apiResponse?.response?.data)
    ? apiResponse.response.data
    : [];

  const pagination = apiResponse?.response?.pagination || null;

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
  };

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <Billing />
      <NavbarItem title="Document-I" breadcrumbs={breadcrumbs} />

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            {pagination && (
              <p className="text-sm text-muted-foreground">
                Total: {pagination.total} folder
                {pagination.total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search folders..."
                className="pl-8"
                value={searchText}
                onChange={handleSearch}
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </div>
        </div>

        {error ? (
          <div className="flex items-center justify-center py-8 text-destructive">
            <p>Error loading folders. Please try again.</p>
          </div>
        ) : selectedDocument ? (
          <div className="flex gap-4 h-[calc(100vh-200px)]">
            {/* Left Panel - Folder Tree */}
            <div className="w-1/2 border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900 overflow-auto">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Folder Tree</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedDocument(null)}
                  className="h-8 px-2 text-xs"
                >
                  Close Preview
                </Button>
              </div>
              <FolderTree 
                folders={folders} 
                isLoading={isLoading} 
                slug={slug}
                onDocumentClick={handleDocumentClick}
              />
            </div>
            
            {/* Right Panel - Document Preview */}
            <div className="w-1/2 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <DocumentPreview document={selectedDocument} />
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
            <FolderTree 
              folders={folders} 
              isLoading={isLoading} 
              slug={slug}
              onDocumentClick={handleDocumentClick}
            />
          </div>
        )}
      </div>

      <AddDocumentDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        slug={slug}
      />
    </div>
  );
};

export default DocumentI;