import { useState, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import CustomActionMenu from "@/components/custom_action";
import NavbarItem from "@/components/navbar/navbar_item";
import { Navbar2 } from "@/components/navbar2";
import MasterTable from "./components/MasterTable";
import MasterEditor from "./components/MasterEditor";
import { formatSlugToTitle } from "./helpers/formatSlugToTitle";

const Master = ({ slug }) => {
  const paramInitialState = {
    page: 1,
    per_page: 50,
    search: "",
  };
  
  const [masterLength, setMasterLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);
  const [openEditor, setOpenEditor] = useState(false);
  const [selectedMaster, setSelectedMaster] = useState(null);

  const debouncedSearch = useDebounce(searchText, 500);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const onAdd = () => {
    setSelectedMaster(null);
    setOpenEditor(true);
  };

  const onEdit = (master) => {
    setSelectedMaster(master);
    setOpenEditor(true);
  };

  const onRowsPerPageChange = (newRowsPerPage) => {
    setParams((prev) => ({
      ...prev,
      per_page: newRowsPerPage,
    }));
  };

  const pageTitle = formatSlugToTitle(slug);

  const breadcrumbs = [
    { title: "Setup", isNavigation: false },
    { title: "Master", isNavigation: false },
    { title: pageTitle, isNavigation: false },
  ];

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
      <NavbarItem title={pageTitle} breadcrumbs={breadcrumbs} />

      <div className="px-4">
        <CustomActionMenu
          title={pageTitle}
          total={masterLength}
          onAdd={onAdd}
          searchText={searchText}
          handleSearch={handleSearch}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
        />
        <MasterTable
          slug={slug}
          setMasterLength={setMasterLength}
          onEdit={onEdit}
          params={params}
        />
      </div>

      <MasterEditor
        open={openEditor}
        onClose={() => {
          setOpenEditor(false);
          setSelectedMaster(null);
        }}
        slug={slug}
        masterData={selectedMaster}
      />
    </div>
  );
};

export default Master;
