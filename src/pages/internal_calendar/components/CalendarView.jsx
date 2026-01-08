import { useState, useCallback, useMemo, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDialog } from "@/components/custom_dialog";

import { fetchEventList } from "../helpers/fetchEventList";
import { fetchEventMeta } from "../helpers/fetchEventMeta";
import { deleteEvent } from "../helpers/deleteEvent";
import EventFormDialog from "./EventFormDialog";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "../calendarStyles.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const PRIORITY_COLORS = {
  Low: "#22c55e",
  Medium: "#e6a700",
  High: "#f97316",
  Critical: "#ef4444",
};

const CalendarView = ({ slug }) => {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [selectedCalendar, setSelectedCalendar] = useState("");

  const [openEventForm, setOpenEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [slotInfo, setSlotInfo] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const { data: metaData, isLoading: isMetaLoading } = useQuery({
    queryKey: ["eventMeta"],
    queryFn: fetchEventMeta,
  });

  const calendarList = useMemo(() => {
    return Array.isArray(metaData?.response?.calendar_list)
      ? metaData.response.calendar_list
      : [];
  }, [metaData]);

  useEffect(() => {
    if (calendarList.length > 0 && !selectedCalendar) {
      setSelectedCalendar(String(calendarList[0].id));
    }
  }, [calendarList, selectedCalendar]);

  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ["eventList", selectedCalendar],
    queryFn: () => fetchEventList(selectedCalendar),
    enabled: !!selectedCalendar,
  });

  const { mutate: deleteEventMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id) => deleteEvent(id),
    onSuccess: () => {
      toast.success("Event deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["eventList"] });
      setOpenDeleteDialog(false);
      setEventToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete event.");
    },
  });

  const events = useMemo(() => {
    const rawEvents = Array.isArray(eventsData?.response?.events)
      ? eventsData.response.events
      : [];

    return rawEvents.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      allDay: false,
      resource: event,
      priority: event.priority,
      color: PRIORITY_COLORS[event.priority] || "#e6a700",
    }));
  }, [eventsData]);

  const handleNavigate = useCallback(
    (action) => {
      setCurrentDate((prevDate) => {
        const newDate = new Date(prevDate);
        switch (action) {
          case "PREV":
            if (currentView === "month") {
              newDate.setMonth(newDate.getMonth() - 1);
            } else if (currentView === "week") {
              newDate.setDate(newDate.getDate() - 7);
            } else if (currentView === "day") {
              newDate.setDate(newDate.getDate() - 1);
            }
            break;
          case "NEXT":
            if (currentView === "month") {
              newDate.setMonth(newDate.getMonth() + 1);
            } else if (currentView === "week") {
              newDate.setDate(newDate.getDate() + 7);
            } else if (currentView === "day") {
              newDate.setDate(newDate.getDate() + 1);
            }
            break;
          case "TODAY":
            return new Date();
          default:
            break;
        }
        return newDate;
      });
    },
    [currentView]
  );

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event.resource);
    setSlotInfo(null);
    setOpenEventForm(true);
  }, []);

  const handleSelectSlot = useCallback((info) => {
    setSlotInfo(info);
    setSelectedEvent(null);
    setOpenEventForm(true);
  }, []);

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setSlotInfo({ start: new Date(), end: new Date() });
    setOpenEventForm(true);
  };

  const handleCloseEventForm = () => {
    setOpenEventForm(false);
    setSelectedEvent(null);
    setSlotInfo(null);
  };

  const handleOpenDeleteDialog = (event) => {
    setEventToDelete(event);
    setOpenDeleteDialog(true);
  };

  const handleCalendarChange = (value) => {
    setSelectedCalendar(value);
  };

  const eventStyleGetter = useCallback((event) => {
    const backgroundColor = event.color || "#e6a700";
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "#fff",
        border: "none",
        display: "block",
        fontSize: "12px",
        fontWeight: "500",
        padding: "2px 6px",
      },
    };
  }, []);

  const dayPropGetter = useCallback((date) => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return {
        style: {
          backgroundColor: "#e8f4fd",
        },
      };
    }
    return {};
  }, []);

  const CustomToolbar = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-2">
      <div className="flex items-center gap-3">
        <Button
          onClick={handleNewEvent}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Event
        </Button>

        <Select value={selectedCalendar} onValueChange={handleCalendarChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select calendar" />
          </SelectTrigger>
          <SelectContent>
            {calendarList.map((calendar) => (
              <SelectItem key={calendar.id} value={String(calendar.id)}>
                {calendar.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => handleNavigate("TODAY")}>
          Today
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleNavigate("PREV")}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleNavigate("NEXT")}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <span className="text-lg font-semibold min-w-[160px] text-center">
          {format(currentDate, "MMMM yyyy")}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {["week", "day", "month", "agenda"].map((view) => (
          <Button
            key={view}
            variant={currentView === view ? "default" : "outline"}
            onClick={() => setCurrentView(view)}
            className="capitalize"
          >
            {view}
          </Button>
        ))}
      </div>
    </div>
  );

  if (isMetaLoading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border p-8 text-center">
        <p className="text-gray-500">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border">
      <CustomToolbar />

      <div
        className="calendar-container"
        style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}
      >
        {isEventsLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            view={currentView}
            onView={(view) => setCurrentView(view)}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            toolbar={false}
            popup
            views={["month", "week", "day", "agenda"]}
            step={30}
            showMultiDayTimes
            style={{ height: "100%" }}
          />
        )}
      </div>

      <div className="flex items-center gap-4 p-4 border-t">
        <span className="text-sm font-medium text-muted-foreground">Priority:</span>
        {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
          <div key={priority} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-muted-foreground">{priority}</span>
          </div>
        ))}
      </div>

      <EventFormDialog
        open={openEventForm}
        onClose={handleCloseEventForm}
        event={selectedEvent}
        slotInfo={slotInfo}
        onDelete={handleOpenDeleteDialog}
        contactSlugFromUrl={slug}
      />

      <CustomDialog
        onOpen={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setEventToDelete(null);
        }}
        title={eventToDelete?.title}
        modalType="Delete"
        id={eventToDelete?.id}
        isLoading={isDeleting}
        onDelete={() => deleteEventMutation(eventToDelete?.id)}
      />
    </div>
  );
};

export default CalendarView;

