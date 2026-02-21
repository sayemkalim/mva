import { useState } from "react";
import { 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  File, 
  Download, 
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DocumentPreview = ({ document }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-gray-50 dark:bg-gray-900/50">
        <div className="p-6 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <FileText className="h-16 w-16 opacity-50" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Document Selected</h3>
        <p className="text-sm text-center max-w-sm">
          Click on any document from the folder tree to preview it here
        </p>
      </div>
    );
  }

  const { attachment } = document;
  
  if (!attachment) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <AlertCircle className="h-16 w-16 opacity-50 mb-4" />
        <h3 className="text-lg font-medium mb-2">No Attachment Available</h3>
        <p className="text-sm">This document doesn't have an attached file</p>
      </div>
    );
  }

  const getDocumentIcon = (extension) => {
    switch (extension?.toLowerCase()) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-600" />;
      case "doc":
      case "docx":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "svg":
        return <FileImage className="h-5 w-5 text-pink-600" />;
      default:
        return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const isImage = (extension) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    return imageExtensions.includes(extension?.toLowerCase());
  };

  const isPdf = (extension) => {
    return extension?.toLowerCase() === "pdf";
  };

  const isOfficeDocument = (extension) => {
    const officeExtensions = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
    return officeExtensions.includes(extension?.toLowerCase());
  };

  const handleDownload = () => {
    if (attachment?.path) {
      const link = globalThis.document.createElement('a');
      link.href = attachment.path;
      link.download = attachment.original_name || 'document';
      link.target = '_blank';
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
    }
  };

  const renderPreview = () => {
    const extension = attachment.extension;

    if (isImage(extension)) {
      return (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading image...</span>
            </div>
          )}
          {hasError && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-12 w-12 opacity-50" />
              <span>Failed to load image</span>
            </div>
          )}
          <img
            src={attachment.path}
            alt={document.title}
            className={cn(
              "max-w-full max-h-full object-contain rounded-lg shadow-lg",
              (isLoading || hasError) && "hidden"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            onLoadStart={() => {
              setIsLoading(true);
              setHasError(false);
            }}
          />
        </div>
      );
    }

    if (isPdf(extension)) {
      return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg min-h-[600px]">
          <iframe
            src={`${attachment.path}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`}
            title={document.title}
            className="w-full h-full min-h-[600px] rounded-lg border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />
        </div>
      );
    }

    if (isOfficeDocument(extension)) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(attachment.path)}`;
      return (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg min-h-[600px]">
          <iframe
            src={officeViewerUrl}
            title={document.title}
            className="w-full h-full min-h-[600px] rounded-lg border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
          />
        </div>
      );
    }

    // For other file types, show a download/info view
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="p-8 rounded-full bg-gray-100 dark:bg-gray-800 inline-block">
            {getDocumentIcon(extension)}
            <div className="mt-2 text-4xl">
              {getDocumentIcon(extension)}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Preview Not Available</h3>
            <p className="text-sm text-muted-foreground">
              This file type cannot be previewed in the browser. You can download it to view the content.
            </p>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download File
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b dark:border-gray-800 p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {document.title || "Untitled Document"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {attachment.original_name}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(attachment.path, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            {getDocumentIcon(attachment.extension)}
            <span className="uppercase font-medium">
              {attachment.extension || 'Unknown'}
            </span>
          </div>
          <span>•</span>
          <span>{formatFileSize(attachment.size)}</span>
          {document.doc_received_date && (
            <>
              <span>•</span>
              <span>Received: {new Date(document.doc_received_date).toLocaleDateString()}</span>
            </>
          )}
        </div>

        {document.memo && (
          <div className="mt-3">
            <Badge variant="secondary" className="text-xs">
              Memo: {document.memo}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderPreview()}
      </div>
    </div>
  );
};

export default DocumentPreview;