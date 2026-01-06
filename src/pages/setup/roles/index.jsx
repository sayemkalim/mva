import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Navbar2 } from "@/components/navbar2";
import NavbarItem from "@/components/navbar/navbar_item";
import CustomActionMenu from "@/components/custom_action";
import { getRoleList } from "./helpers";
import RolesTable from "./components/RolesTable";
import RoleEditor from "./components/RoleEditor";
import Typography from "@/components/typography";

const Permissions = () => {
  const [searchText, setSearchText] = useState("");
  const [openEditor, setOpenEditor] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  const debouncedSearch = useDebounce(searchText, 500);

  const { data: rolesList, isLoading, error } = useQuery({
    queryKey: ["rolesList", debouncedSearch],
    queryFn: async () => {
      const response = await getRoleList();
      return response;
    },
  });

  const roles = rolesList?.response?.data || [];
  
  // Filter roles based on search
  const filteredRoles = roles.filter((role) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      role.name?.toLowerCase().includes(searchLower) ||
      role.id?.toString().includes(searchLower)
    );
  });

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const onAdd = () => {
    setSelectedRole(null);
    setOpenEditor(true);
  };

  const onEdit = (role) => {
    setSelectedRole(role);
    setOpenEditor(true);
  };

  const breadcrumbs = [
    { title: "Setup", isNavigation: false },
    { title: "Roles", isNavigation: false },
  ];

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <NavbarItem title="Roles Management" breadcrumbs={breadcrumbs} />
      
      <div className="px-4">
        <Typography variant="p" className="text-gray-600 mb-4">
          Manage user roles and permissions
        </Typography>

        <CustomActionMenu
          title="Roles"
          total={filteredRoles.length}
          onAdd={onAdd}
          searchText={searchText}
          handleSearch={handleSearch}
        />

        {error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Typography variant="h3" className="text-red-500 mb-2">
              Error loading roles
            </Typography>
            <Typography variant="p" className="text-gray-500">
              {error.message || "Something went wrong"}
            </Typography>
          </div>
        ) : (
          <RolesTable
            roles={filteredRoles}
            isLoading={isLoading}
            onEdit={onEdit}
          />
        )}
      </div>

      <RoleEditor
        open={openEditor}
        onClose={() => {
          setOpenEditor(false);
          setSelectedRole(null);
        }}
        roleData={selectedRole}
      />
    </div>
  );
};

export default Permissions;
