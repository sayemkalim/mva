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
import { fetchFolderList } from "./helpers/fetchFolderList";

const DocumentI = () => {
  const { slug } = useParams();
  const [searchText, setSearchText] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <Billing />
      <NavbarItem title="Document-I" breadcrumbs={breadcrumbs} />

      <div className="px-4">
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
        ) : (
          <FolderTree folders={folders} isLoading={isLoading} slug={slug} />
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