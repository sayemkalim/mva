import { useParams } from "react-router-dom";
import NavbarItem from "@/components/navbar/navbar_item";
import { Navbar2 } from "@/components/navbar2";
import CalendarView from "./components/CalendarView";

const InternalCalendar = () => {
  const { slug } = useParams();

  const breadcrumbs = [{ title: "Internal Calendar", isNavigation: false }];

  return (
    <div className="flex flex-col">
      <Navbar2 />
      <NavbarItem title="Internal Calendar" breadcrumbs={breadcrumbs} />

      <div className="px-4 pb-4">
        <CalendarView slug={slug} />
      </div>
    </div>
  );
};

export default InternalCalendar;
