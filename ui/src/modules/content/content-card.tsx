import { TContentCardProps } from "@/types/contentCard";
import { DownloadCloud, FileText, Files, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import FileDataModal from "./file-data-modal";
import RenameModal from "./rename-modal";
import ResizeModal from "./resize-modal";
import useDeleteFileMutation from "./hooks/use-delete-file-mutation";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const ContentCard: React.FC<TContentCardProps> = ({
  file_name,
  type = "documents",
  disabled = false,
  isSelected,
  onSelect,
  isSelecting,
}) => {
  const url = `${window.location.protocol}//${
    window.location.host
  }/api/cdn/download/${type === "documents" ? "docs" : "images"}/${file_name}`;

  const deleteFile = useDeleteFileMutation(
    type === "documents" ? "doc" : "image"
  );

  const handleDeleteFile = () => {
    deleteFile.mutate(file_name);
  };

  return (
    <div className="border rounded-lg shadow-lg flex flex-col min-h-[264px] w-64 max-w-[256px] justify-between items-center gap-4 p-4 relative">
      {isSelecting && (
        <Checkbox
          className="absolute top-2 right-2"
          checked={isSelected}
          onCheckedChange={() => onSelect && onSelect(file_name)}
          disabled={disabled}
          aria-label="Select file"
        />
      )}
      <Dialog>
        <DialogTrigger disabled={isSelecting}>
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
      <div className="w-full flex flex-col gap-2">
        <p className="truncate">{file_name}</p>
        {/* Non-destructive buttons */}
        <div className={`flex w-full justify-between ${disabled && "sr-only"}`}>
          <div className="flex">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sky-600"
                  onClick={() => {
                    navigator.clipboard.writeText(url);
                    toast.success("clipboard saved");
                  }}
                  aria-label="Copy Link"
                  disabled={isSelecting}
                >
                  <Files />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Copy Link to clipboard</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sky-600"
                  disabled={isSelecting}
                  asChild={!isSelecting}
                >
                  <a href={url} download aria-label="Download file">
                    <DownloadCloud />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Download file</p>
              </TooltipContent>
            </Tooltip>
            <RenameModal
              type={type}
              filename={file_name}
              isSelecting={isSelecting}
            />
            {type === "images" && (
              <ResizeModal
                filename={file_name ?? ""}
                isSelecting={isSelecting}
              />
            )}
          </div>
          {/* Destructive buttons */}
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => file_name && handleDeleteFile()}
                  aria-label="Delete file"
                  disabled={isSelecting}
                >
                  <Trash2 className="inline" size="24" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete file</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
