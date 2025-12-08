import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDebounce } from "@uidotdev/usehooks";
import CustomActionMenu from "@/components/custom_action";
import NavbarItem from "@/components/navbar/navbar_item";
import { Navbar2 } from "@/components/navbar2";
import ConflictTable from "./components/CostTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CostTable from "./components/CostTable";

const Cost = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const paramInitialState = {
    page: 1,
    per_page: 50,
    search: "",
  };

  const [blogsLength, setBlogsLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(searchText, 500);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const onAdd = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSoftCost = () => {
    setIsModalOpen(false);
    navigate(`/dashboard/cost-soft/add/${slug}`);
  };

  const handleHardCost = () => {
    setIsModalOpen(false);
    navigate(`/dashboard/cost-hard/add/${slug}`);
  };

  const handleTimeCost = () => {
    setIsModalOpen(false);
    navigate(`/dashboard/cost-timecard/add/${slug}`);
  };

  const onRowsPerPageChange = (newRowsPerPage) => {
    setParams((prev) => ({
      ...prev,
      per_page: newRowsPerPage,
    }));
  };

  const breadcrumbs = [{ title: "Cost", isNavigation: false }];

  useEffect(() => {
    if (params.search !== debouncedSearch) {
      setParams((prev) => ({
        ...prev,
        search: debouncedSearch,
      }));
    }
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <NavbarItem title="Cost" breadcrumbs={breadcrumbs} />

      <div className="px-4">
        <CustomActionMenu
          title="Cost"
          total={blogsLength}
          onAdd={onAdd}
          searchText={searchText}
          handleSearch={handleSearch}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
        />
        <CostTable
          slug={slug}
          setBlogsLength={setBlogsLength}
          params={params}
          setParams={setParams}
        />
      </div>

      {/* Selection Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Select Cost Type</DialogTitle>
            <DialogDescription>
              Please choose the type of cost you want to add.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <Button
              onClick={handleSoftCost}
              className="w-full h-20 text-lg"
              variant="outline"
            >
              Add Soft Cost
            </Button>
            <Button
              onClick={handleHardCost}
              className="w-full h-20 text-lg"
              variant="outline"
            >
              Add Hard Cost
            </Button>
            <Button
              onClick={handleTimeCost}
              className="w-full h-20 text-lg"
              variant="outline"
            >
              Add Time Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cost;
