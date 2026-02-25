import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDebounce } from "@uidotdev/usehooks";
import CustomActionMenu from "@/components/custom_action";
import NavbarItem from "@/components/navbar/navbar_item";
import { Navbar2 } from "@/components/navbar2";
import UserTable from "./components/UserTable";


const UserSetup = () => {
  const navigate = useNavigate();

  const paramInitialState = {
    page: 1,
    per_page: 25,
    search: "",
  };
  const [usersLength, setUsersLength] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);

  const debouncedSearch = useDebounce(searchText, 500);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const onAdd = () => {
    navigate("/dashboard/setup/user/add");
  };

  const onRowsPerPageChange = (newRowsPerPage) => {
    setParams((prev) => ({
      ...prev,
      per_page: newRowsPerPage,
    }));
  };

  const breadcrumbs = [
    { title: "Setup", isNavigation: false },
    { title: "Users", isNavigation: false },
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
      <NavbarItem title="Users" breadcrumbs={breadcrumbs} />

      <div className="px-4">
        <CustomActionMenu
          title="Users"
          total={usersLength}
          onAdd={onAdd}
          searchText={searchText}
          handleSearch={handleSearch}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
        />
        <UserTable
          setUsersLength={setUsersLength}
          params={params}
          setParams={setParams}
        />
      </div>
    </div>
  );
};

export default UserSetup;
