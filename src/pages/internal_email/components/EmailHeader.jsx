import { useState, useEffect } from "react";
import { Search, Settings, HelpCircle, Grid3x3, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AccountManagement from "./AccountManagement";
import { useQueryClient } from "@tanstack/react-query";

const EmailHeader = ({
  accounts,
  selectedAccount,
  onAccountSelect,
  defaultAccount,
  onSearch,
  searchQuery: initialSearchQuery = "",
  slug,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isAccountManagementOpen, setIsAccountManagementOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== initialSearchQuery) {
        onSearch?.(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch, initialSearchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span className="text-xl font-normal text-foreground">Emails</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search mail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 bg-muted/50 border-border focus-visible:ring-1 focus-visible:ring-ring"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 min-w-[200px] justify-end">

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 px-2 gap-2 hover:bg-accent"
              >
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {selectedAccount?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-2 py-1.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {selectedAccount?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedAccount?.email || "No Account"}
                    </p>
                    {defaultAccount?.id === selectedAccount?.id && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3 text-primary" />
                        <span>Default</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {Array.isArray(accounts) && accounts.length > 1 && (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Switch Account
                    </p>
                    {accounts
                      .filter((acc) => acc.id !== selectedAccount?.id)
                      .map((account) => (
                        <DropdownMenuItem
                          key={account.id}
                          onClick={() => onAccountSelect(account)}
                          className="flex items-center gap-2 px-2 py-1.5"
                        >
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                            {account.email?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{account.email}</p>
                            {defaultAccount?.id === account.id && (
                              <p className="text-xs text-muted-foreground">
                                Default
                              </p>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                  </div>
                  {/* <DropdownMenuSeparator /> */}
                </>
              )}

              {/* <DropdownMenuItem onClick={() => setIsAccountManagementOpen(true)}>
                <Settings className="size-4 mr-2" />
                Manage Accounts
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setIsAccountManagementOpen(true)}>
                <User className="size-4 mr-2" />
                Add Account
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AccountManagement
        open={isAccountManagementOpen}
        onClose={() => setIsAccountManagementOpen(false)}
        accounts={accounts}
        defaultAccount={defaultAccount}
        onAccountAdded={() => {
          queryClient.invalidateQueries(["emailAccounts"]);
        }}
        onAccountDeleted={() => {
          queryClient.invalidateQueries(["emailAccounts"]);
        }}
        slug={slug}
      />
    </>
  );
};

export default EmailHeader;

