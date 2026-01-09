import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDebounce } from "@uidotdev/usehooks";
import CustomActionMenu from "@/components/custom_action";
import NavbarItem from "@/components/navbar/navbar_item";
import { Navbar2 } from "@/components/navbar2";
import PoliceTable from "./components/PoliceTable";

const PoliceReport = () => {
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

  const debouncedSearch = useDebounce(searchText, 500);
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const onAdd = () => {
    navigate(`/dashboard/police-report/add/${slug}`);
  };

  const onRowsPerPageChange = (newRowsPerPage) => {
    setParams((prev) => ({
      ...prev,
      per_page: newRowsPerPage,
    }));
  };

  const breadcrumbs = [{ title: "Police Report", isNavigation: false }];

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
      <NavbarItem title="Police Report" breadcrumbs={breadcrumbs} />

      <div className="px-4">
        <CustomActionMenu
          title="Police Report"
          total={blogsLength}
          onAdd={onAdd}
          searchText={searchText}
          handleSearch={handleSearch}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
        />
        <PoliceTable
          slug={slug}
          setBlogsLength={setBlogsLength}
          params={params}
          setParams={setParams}
        />
      </div>
    </div>
  );
};

export default PoliceReport;
