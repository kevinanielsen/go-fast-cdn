import { useDeleteFile } from "../queries";
import { TContentCardProps } from "../types/contentCard";
import { DownloadCloud, FileText, Files, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import FileDataModal from "./file-data-modal";
import RenameModal from "./rename-modal";
import ResizeModal from "./resize-modal";
import { Button } from "./ui/button";
import { Dialog, DialogTrigger } from "./ui/dialog";

const ContentCard: React.FC<TContentCardProps> = ({
  file_name,
  type = "documents",
  disabled = false,
  // ID,
  // createdAt,
  // updatedAt,
}) => {
  const url = `${window.location.protocol}//${
    window.location.host
  }/api/cdn/download/${type === "documents" ? "docs" : "images"}/${file_name}`;


  const deleteFile = useDeleteFile(type === "documents" ? "doc" : "image");

  const handleDeleteFile = () => {
    deleteFile.mutate(file_name);
  };

  return (
    <div className="border rounded-lg shadow-lg flex flex-col min-h-[264px] w-64 max-w-[256px] justify-between items-center gap-4 p-4">
      <Dialog>
        <DialogTrigger>
          {type === "images" ? (
            <img
              src={url}
              alt={file_name}
              width={224}
              height={150}
              className="object-cover max-h-[150px] max-w-[224px]"
            />
          ) : (
            <FileText size="128" />
          )}
        </DialogTrigger>
        <FileDataModal filename={file_name} type={type} />
      </Dialog>
      <div className="w-full flex flex-col">
        <p className="truncate w-64 pr-7">{file_name}</p>
        {/* Non-destructive buttons */}
        <div className={`flex w-full justify-between ${disabled && "sr-only"}`}>
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="text-sky-600"
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success("clipboard saved");
              }}
              aria-label="Copy Link"
            >
              <Files className="inline" size="24" />
            </Button>
            <a
              className="hover:bg-accent hover:text-accent-foreground h-10 w-10 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-sky-600"
              aria-label="Download file"
              href={url}
              download
            >
              <DownloadCloud className="inline" size="24" />
            </a>
            <RenameModal type={type} filename={file_name} />
            {type === "images" && <ResizeModal filename={file_name ?? ""} />}
          </div>
          {/* Destructive buttons */}
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => file_name && handleDeleteFile()}
              aria-label="Delete file"
            >
              <Trash2 className="inline" size="24" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
