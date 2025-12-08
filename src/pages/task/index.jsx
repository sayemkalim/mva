import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDebounce } from "@uidotdev/usehooks";
import CustomActionMenu from "@/components/custom_action";
import NavbarItem from "@/components/navbar/navbar_item";
import { Navbar2 } from "@/components/navbar2";
import TaskTable from "./components/TaskTable";

const Task = () => {
  const navigate = useNavigate();
  const { slug } = useParams();

  const paramInitialState = {
    page: 1,
    per_page: 50,
    search: "",
  };
  const [blogsLength, setBlogsLength] = useState("");
  const [searchText, setSearchText] = useState("");
  const [params, setParams] = useState(paramInitialState);

  const debouncedSearch = useDebounce(searchText, 500);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };
  const onAdd = () => {
    if (slug) {
      navigate(`/dashboard/task/add/${slug}`);
    } else {
      navigate(`/dashboard/task/add`);
    }
  };

  const onRowsPerPageChange = (newRowsPerPage) => {
    setParams((prev) => ({
      ...prev,
      per_page: newRowsPerPage,
    }));
  };

  const breadcrumbs = [{ title: "Tasks", isNavigation: false }];

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
      <NavbarItem title="Tasks" breadcrumbs={breadcrumbs} />

      <div className="px-4">
        <CustomActionMenu
          title="Tasks"
          total={blogsLength}
          onAdd={onAdd}
          searchText={searchText}
          handleSearch={handleSearch}
          onRowsPerPageChange={onRowsPerPageChange}
          showRowSelection={true}
          rowsPerPage={params.per_page}
        />
        <TaskTable
          slug={slug}
          setBlogsLength={setBlogsLength}
          params={params}
          setParams={setParams}
        />
      </div>
    </div>
  );
};

export default Task;
