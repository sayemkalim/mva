import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchbilling } from "./helper/getbilling";

const Billing = () => {
  const { slug } = useParams(); 

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["billing", slug],
    queryFn: () => fetchbilling(slug),
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="bg-card border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm">
          <span className="text-muted-foreground">Loading billing data...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-card border-b px-6 py-3">
        <div className="flex items-center justify-end gap-6 text-sm">
          <span className="text-destructive">Error: {error.message}</span>
        </div>
      </div>
    );
  }

  const unpaid = data?.unpaid || 0;
  const unbilled = data?.unbilled || 0;
  const clientFundsOperating = data?.client_funds_operating || 0;
  const clientFundsTrust = data?.client_funds_trust || 0;

  return (
    <div className="bg-card border-b px-6 py-3">
      <div className="flex items-center justify-end gap-6 text-sm">
        <span className="text-foreground">
          Unpaid: <span className="font-semibold">$ {unpaid}</span>
        </span>
        <span className="text-foreground">
          Unbilled: <span className="font-semibold">$ {unbilled}</span>
        </span>
        <span className="text-foreground">
          Client Funds-Operating: <span className="font-semibold">$ {clientFundsOperating}</span>
        </span>
        <span className="text-foreground">
          Client Funds-Trust: <span className="font-semibold">$ {clientFundsTrust}</span>
        </span>
      </div>
    </div>
  );
};

export default Billing;
