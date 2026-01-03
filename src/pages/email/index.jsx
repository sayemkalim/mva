import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import EmailHeader from "./components/EmailHeader";
import EmailSidebar from "./components/EmailSidebar";
import EmailList from "./components/EmailList";
import EmailDetail from "./components/EmailDetail";
import ComposeEmail from "./components/ComposeEmail";
import {
  fetchAccounts,
  fetchDefaultAccount,
  setDefaultAccount,
} from "./helpers";
import { Inbox, Send, FileText, Trash2, Star } from "lucide-react";


const Email = () => {
  const queryClient = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitialData, setComposeInitialData] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: accountsData } = useQuery({
    queryKey: ["emailAccounts"],
    queryFn: fetchAccounts,
  });

  const { data: defaultAccountData } = useQuery({
    queryKey: ["defaultAccount"],
    queryFn: fetchDefaultAccount,
  });

  const accounts = useMemo(() => {
    const accountsArray =
      accountsData?.response?.accounts ||
      accountsData?.accounts ||
      accountsData?.response?.data ||
      accountsData?.response ||
      accountsData?.data ||
      accountsData;
    return Array.isArray(accountsArray) ? accountsArray : [];
  }, [accountsData]);

  const defaultAccount = useMemo(() => {
    return (
      defaultAccountData?.response?.data ||
      defaultAccountData?.response?.account ||
      defaultAccountData?.response ||
      defaultAccountData?.data ||
      defaultAccountData
    );
  }, [defaultAccountData]);

  useEffect(() => {
    if (!selectedAccount) {
      if (defaultAccount && defaultAccount.id) {
        setSelectedAccount(defaultAccount);
      } else if (accounts.length > 0 && accounts[0]?.id) {
        setSelectedAccount(accounts[0]);
      }
    }
  }, [defaultAccount, accounts, selectedAccount]);

  const folders = [
    { id: "inbox", label: "Inbox", icon: Inbox, count: 0 },
    { id: "starred", label: "Starred", icon: Star, count: 0 },
    { id: "sent", label: "Sent", icon: Send, count: 0 },
    { id: "draft", label: "Drafts", icon: FileText, count: 0 },
    { id: "trash", label: "Trash", icon: Trash2, count: 0 },
  ];

  const handleAccountSelect = async (account) => {
    console.log("account >>>>>>>>>>>>>>>>>>>", account);
    try {
      await setDefaultAccount(account.id);
      setSelectedAccount(account);
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Error switching account:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <EmailHeader
        accounts={accounts}
        selectedAccount={selectedAccount}
        onAccountSelect={handleAccountSelect}
        defaultAccount={defaultAccount}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      <div className="flex flex-1 overflow-hidden">
        <EmailSidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onFolderSelect={(folder) => {
            setSelectedFolder(folder);
            setSelectedEmail(null);
            setSearchQuery("");
          }}
          onCompose={() => {
            setComposeInitialData(null);
            setIsComposeOpen(true);
          }}
        />

        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <div className="flex flex-1 overflow-hidden">
            {selectedEmail ? (
              <EmailDetail
                email={selectedEmail}
                onBack={() => setSelectedEmail(null)}
                onDelete={() => {
                  queryClient.invalidateQueries(["emails", selectedFolder]);
                  setSelectedEmail(null);
                }}
                onMove={(_, folder) => {
                  queryClient.invalidateQueries(["emails", selectedFolder]);
                  if (folder !== selectedFolder) {
                    setSelectedEmail(null);
                  }
                }}
                onReply={(data) => {
                  setComposeInitialData(data);
                  setIsComposeOpen(true);
                }}
                accounts={accounts}
                defaultAccount={selectedAccount}
              />
            ) : (
              <EmailList
                folder={selectedFolder}
                accountId={selectedAccount?.id}
                searchQuery={searchQuery}
                onEmailSelect={(email) => {
                  if (selectedFolder === "draft") {
                    setComposeInitialData(email);
                    setIsComposeOpen(true);
                  } else {
                    setSelectedEmail(email);
                  }
                }}
                onRefresh={() => {
                  queryClient.invalidateQueries(["emails", selectedFolder]);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {isComposeOpen && (
        <ComposeEmail
          open={isComposeOpen}
          onClose={() => {
            setIsComposeOpen(false);
            setComposeInitialData(null);
          }}
          accounts={accounts}
          defaultAccount={selectedAccount}
          initialData={composeInitialData}
          onSuccess={() => {
            queryClient.invalidateQueries(["emails", "sent"]);
            queryClient.invalidateQueries(["emails", "draft"]);
          }}
        />
      )}
    </div>
  );
};

export default Email;
