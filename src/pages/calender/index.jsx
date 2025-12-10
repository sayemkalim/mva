import NavbarItem from "@/components/navbar/navbar_item";
import { Navbar2 } from "@/components/navbar2";
import CalendarView from "./components/CalendarView";

const Calender = () => {
  const breadcrumbs = [{ title: "Calender", isNavigation: false }];

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <NavbarItem title="Calender" breadcrumbs={breadcrumbs} />

      <div className="px-4 pb-4">
        <CalendarView />
      </div>
    </div>
  );
};

export default Calender;
