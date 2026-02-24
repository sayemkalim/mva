import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
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
import { fetchEventById } from "../helpers/fetchEventById";
import { deleteEvent } from "../helpers/deleteEvent";
import { updateEvent } from "../helpers/createEvent";
import EventFormDialog from "./EventFormDialog";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../calendarStyles.css";

// Add custom styles for better resize UX
const customStyles = `
  /* Event hover effects */
  .rbc-event:hover .resize-handle-top,
  .rbc-event:hover .resize-handle-bottom,
  .rbc-event:hover .drag-indicator {
    opacity: 1 !important;
  }
  
  .rbc-event:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    z-index: 1000 !important;
    transform: translateY(-1px) !important;
    transition: all 0.2s ease !important;
  }
  
  /* Resize handle hover effects */
  .resize-handle-top:hover,
  .resize-handle-bottom:hover {
    background: rgba(255,255,255,0.9) !important;
    height: 8px !important;
  }
  
  .resize-handle-top:hover {
    top: -4px !important;
  }
  
  .resize-handle-bottom:hover {
    bottom: -4px !important;
  }
  
  /* Drag indicator hover */
  .drag-indicator:hover {
    background: rgba(255,255,255,0.5) !important;
    width: 10px !important;
  }
  
  /* Dragging state */
  .rbc-addons-dnd-dragging {
    opacity: 0.8 !important;
    transform: rotate(2deg) scale(1.02) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
    z-index: 2000 !important;
  }
  
  /* Resizing state */
  .rbc-addons-dnd-resizing {
    opacity: 0.9 !important;
    border: 2px dashed rgba(255,255,255,0.9) !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
  }
  
  /* Month view optimization */
  .rbc-month-view .rbc-event {
    cursor: move !important;
  }
  
  /* Week/Day view enhancements */
  .rbc-time-view .rbc-event {
    border-radius: 4px !important;
    overflow: visible !important;
  }
  
  /* Improve overall event appearance */
  .rbc-event {
    border: none !important;
    transition: all 0.2s ease !important;
  }
  
  .rbc-event-content {
    padding: 2px 4px !important;
  }
  
  /* Cursor hints */
  .rbc-time-view .rbc-event:not(.rbc-addons-dnd-dragging):not(.rbc-addons-dnd-resizing) {
    cursor: move !important;
  }
  
  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .rbc-event,
    .resize-handle-top,
    .resize-handle-bottom,
    .drag-indicator {
      transition: none !important;
      transform: none !important;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('calendar-custom-styles') || document.createElement('style');
  styleElement.id = 'calendar-custom-styles';
  styleElement.textContent = customStyles;
  if (!document.getElementById('calendar-custom-styles')) {
    document.head.appendChild(styleElement);
  }
}

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

const DragAndDropCalendar = withDragAndDrop(Calendar);

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
  const updateTimeoutRef = useRef(null);

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

  const { mutate: updateEventMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => updateEvent(id, data),
    onSuccess: () => {
      toast.success("Event moved successfully.");
      queryClient.invalidateQueries({ queryKey: ["eventList"] });
    },
    onError: (error) => {
      toast.error("Failed to move event.");
      console.error("Update error:", error);
    },
  });

  // Debounced update function to prevent too many API calls
  const debouncedUpdate = useCallback((id, data) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      updateEventMutation({ id, data });
    }, 300);
  }, [updateEventMutation]);

  const events = useMemo(() => {
    if (!eventsData?.response?.events) return [];
    
    const rawEvents = Array.isArray(eventsData.response.events)
      ? eventsData.response.events
      : [];

    return rawEvents.map((event) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      allDay: Boolean(event.all_day),
      resource: event, // Keep the full original event data
      priority: event.priority,
      color: PRIORITY_COLORS[event.priority] || "#e6a700",
    }));
  }, [eventsData?.response?.events]);

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

  const handleEventDrop = useCallback(
    async ({ event, start, end }) => {
      const eventId = event.resource.id;
      
      try {
        // Fetch complete event data first
        const eventResponse = await fetchEventById(eventId);
        const completeEventData = eventResponse?.response?.event;
        
        if (!completeEventData) {
          toast.error("Failed to fetch event details");
          return;
        }
        const updatedEventData = {
          // Use complete event data as base
          ...completeEventData,
          // Update only the time-related fields
          start_time: start.toISOString().slice(0, 19).replace('T', ' '),
          end_time: end.toISOString().slice(0, 19).replace('T', ' '),
        };

        debouncedUpdate(eventId, updatedEventData);
      } catch (error) {
        console.error("Error fetching event data:", error);
        toast.error("Failed to update event");
      }
    },
    [debouncedUpdate]
  );

  const handleEventResize = useCallback(
    async ({ event, start, end }) => {
      const eventId = event.resource.id;
      
      try {
        // Fetch complete event data first
        const eventResponse = await fetchEventById(eventId);
        const completeEventData = eventResponse?.response?.event;
        
        if (!completeEventData) {
          toast.error("Failed to fetch event details");
          return;
        }
        const updatedEventData = {
          // Use complete event data as base
          ...completeEventData,
          // Update only the time-related fields
          start_time: start.toISOString().slice(0, 19).replace('T', ' '),
          end_time: end.toISOString().slice(0, 19).replace('T', ' '),
        };
        debouncedUpdate(eventId, updatedEventData);
      } catch (error) {
        console.error("Error fetching event data for resize:", error);
        toast.error("Failed to update event");
      }
    },
    [debouncedUpdate]
  );

  // Memoized style functions for performance
  const eventStyleGetter = useMemo(
    () => (event) => {
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
    },
    []
  );

  const dayPropGetter = useMemo(() => {
    const today = new Date();
    return (date) => {
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
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
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
    <DndProvider backend={HTML5Backend}>
      <div className="bg-card rounded-lg shadow-sm border">
        <CustomToolbar />

        <div
          className="calendar-container"
          style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}
        >
          {isEventsLoading || isUpdating ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                {isEventsLoading ? "Loading events..." : "Updating event..."}
              </p>
            </div>
          ) : (
            <DragAndDropCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              onNavigate={setCurrentDate}
              view={currentView}
              onView={setCurrentView}
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
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              draggableAccessor={() => true}
              resizable={true}
              resizableAccessor={() => true}
              dragFromOutsideItem={null}
              onDropFromOutside={null}
              components={{
                event: ({ event }) => (
                  <div 
                    className="rbc-event-content" 
                    style={{ position: 'relative', width: '100%', height: '100%' }}
                    title={`${event.title} - Drag to move, drag edges to resize`}
                  >
                    <strong style={{ 
                      fontSize: currentView === 'month' ? '11px' : '12px',
                      lineHeight: 1.2,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: currentView === 'month' ? 'nowrap' : 'normal'
                    }}>
                      {event.title}
                    </strong>
                    
                    {/* Show resize handles only in week/day view for better UX */}
                    {(currentView === 'week' || currentView === 'day') && (
                      <>
                        {/* Top resize handle */}
                        <div 
                          className="rbc-addons-dnd-resize-ns-anchor resize-handle-top"
                          style={{
                            position: 'absolute',
                            top: '-3px',
                            left: '0',
                            right: '0',
                            height: '6px',
                            background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)',
                            cursor: 'ns-resize',
                            borderRadius: '4px 4px 0 0',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            zIndex: 10
                          }}
                        />
                        
                        {/* Bottom resize handle */}
                        <div 
                          className="rbc-addons-dnd-resize-ns-anchor resize-handle-bottom"
                          style={{
                            position: 'absolute',
                            bottom: '-3px',
                            left: '0',
                            right: '0',
                            height: '6px',
                            background: 'linear-gradient(to top, rgba(255,255,255,0.8), transparent)',
                            cursor: 'ns-resize',
                            borderRadius: '0 0 4px 4px',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            zIndex: 10
                          }}
                        />
                        
                        {/* Central drag area indicator */}
                        <div 
                          className="drag-indicator"
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: '4px',
                            transform: 'translateY(-50%)',
                            width: '8px',
                            height: '16px',
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: '2px',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            cursor: 'move',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                            fontSize: '6px',
                            color: 'rgba(255,255,255,0.8)'
                          }}
                        >
                          <div style={{ width: '2px', height: '2px', background: 'currentColor', borderRadius: '50%' }} />
                          <div style={{ width: '2px', height: '2px', background: 'currentColor', borderRadius: '50%' }} />
                          <div style={{ width: '2px', height: '2px', background: 'currentColor', borderRadius: '50%' }} />
                        </div>
                      </>
                    )}
                  </div>
                )
              }}
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
    </DndProvider>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(CalendarView);

