import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

const searchContact = async (searchQuery = "") => {
  const apiResponse = await apiService({
    endpoint: endpoints.searchContact,
    method: "POST",
    data: { searchBar: searchQuery },
    headers: {
      "Content-Type": "application/json",
    },
  });
  return apiResponse;
};

const ContactSearch = ({
  onSelect,
  initialId,
  initialSlug,
  initialContactName,
  label = "Contact",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const containerRef = useRef(null);

  const {
    data: contactsResponse,
    isLoading: isSearching,
    isError,
  } = useQuery({
    queryKey: ["searchContacts", debouncedSearch],
    queryFn: () => searchContact(debouncedSearch),
    staleTime: 300000,
  });

  const contacts = contactsResponse?.response?.data || [];

  useEffect(() => {
    if (initialContactName && initialId && !selectedContact) {
      setSelectedContact({
        id: initialId,
        slug: initialSlug,
        contact_name: initialContactName,
      });
    }
  }, [initialContactName, initialId, initialSlug, selectedContact]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (contact) => {
    setSelectedContact(contact);
    onSelect({
      id: contact.id,
      slug: contact.slug,
      contact_name: contact.contact_name,
    });
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedContact(null);
    onSelect({ id: "", slug: "", contact_name: "" });
    setSearchQuery("");
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label className="text-gray-700 font-medium">{label}</Label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={selectedContact ? selectedContact.contact_name : "Search contact..."}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            className={cn(
              "pl-9 pr-9 h-11",
              selectedContact && !searchQuery && "text-foreground"
            )}
          />
          {selectedContact && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {isSearching && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            )}

            {isError && (
              <div className="py-6 text-center text-sm text-red-500">
                Error loading contacts. Please try again.
              </div>
            )}

            {!isSearching && !isError && contacts.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No contacts found.
              </div>
            )}

            {!isSearching && !isError && contacts.length > 0 && (
              <ul className="py-1">
                {contacts.map((contact) => (
                  <li
                    key={contact.id}
                    onClick={() => handleSelect(contact)}
                    className={cn(
                      "px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between",
                      selectedContact?.id === contact.id && "bg-gray-50"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">
                        {contact.contact_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {contact.primary_email}
                      </span>
                    </div>
                    {selectedContact?.id === contact.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {selectedContact && (
        <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-gray-50 border border-gray-200 shadow-sm transition">
          <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full h-7 w-7">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-800">
              {selectedContact.contact_name}
            </div>
            {selectedContact.primary_email && (
              <div className="text-xs text-gray-500">
                {selectedContact.primary_email}
              </div>
            )}
          </div>
          <span className="ml-auto px-2 py-0.5 bg-primary/10 rounded-full text-xs text-primary font-medium tracking-wide">
            Selected
          </span>
        </div>
      )}
    </div>
  );
};

export default ContactSearch;
