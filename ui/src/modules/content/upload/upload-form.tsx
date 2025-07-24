import { sanitizeFileName } from "@/utils";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ImageCardUpload from "./image-card-upload";
import FileInput from "./file-input";
import toast from "react-hot-toast";
import DocCardUpload from "./doc-card-upload";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadProps {
  files: File[];
  onChangeFiles: (files: File[]) => void;
  isLoading: boolean;
  tab: "documents" | "images";
  onChangeTab: (tab: "documents" | "images") => void;
  disableTabSwitching?: boolean;
}

const UploadForm = ({
  isLoading,
  files,
  onChangeFiles,
  onChangeTab,
  tab,
  disableTabSwitching = false,
}: UploadProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleOnChangeFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles) {
        const fileArray = Array.from(selectedFiles);
        onChangeFiles(fileArray);
      }
    },
    [onChangeFiles]
  );

  const handleDeleteFile = useCallback(
    (index: number) => {
      onChangeFiles(files.filter((_, i) => i !== index));
    },
    [files, onChangeFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (isLoading) return;

      const droppedFiles = Array.from(e.dataTransfer.files);

      // check if the dropped files match the current tab
      const acceptedTypes =
        tab === "documents"
          ? [
              "text/plain",
              "application/zip",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "application/pdf",
              "application/rtf",
              "application/x-freearc",
            ]
          : [
              "image/jpeg",
              "image/png",
              "image/jpg",
              "image/webp",
              "image/gif",
              "image/bmp",
            ];
      const isValidFiles = droppedFiles.every((file) =>
        acceptedTypes.includes(file.type)
      );
      if (!isValidFiles) {
        toast.error(
          `Invalid file type. Please upload ${
            tab === "documents" ? "documents" : "images"
          } only.`
        );
        return;
      }
      if (droppedFiles.length === 0) return;
      onChangeFiles([...files, ...droppedFiles]);
    },
    [isLoading, onChangeFiles, files, tab]
  );

  const handleClick = useCallback(() => {
    if (fileRef.current && files.length === 0 && !isLoading) {
      fileRef.current.click();
    }
  }, [files.length, isLoading]);

  return (
    <div
      id="drop-zone"
      className={cn(
        "w-full h-96 border-2 border-dashed rounded-md transition-colors",
        {
          "cursor-pointer": files.length === 0 && !isLoading,
          "border-zinc-300": !isDragOver,
          "border-blue-400 bg-blue-50": isDragOver,
          "opacity-50": isLoading,
        }
      )}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {files.length > 0 ? (
        <div className="flex gap-2 flex-wrap p-2 overflow-y-auto max-h-80">
          {tab === "documents" ? (
            <>
              {files.map((file, index) => (
                <DocCardUpload
                  key={file.name + index}
                  fileName={sanitizeFileName(file).name}
                  onClickDelete={() => handleDeleteFile(index)}
                />
              ))}
            </>
          ) : (
            <>
              {files.map((file, index) => (
                <ImageCardUpload
                  key={file.name + index}
                  fileName={sanitizeFileName(file).name}
                  onClickDelete={() => handleDeleteFile(index)}
                  imageUrl={URL.createObjectURL(file)}
                />
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-full">
          {disableTabSwitching ? (
            // When tab switching is disabled, show content without tabs
            <>
              {isDragOver ? (
                <div className="text-center">
                  <p className="text-blue-600 font-medium">
                    Drop files here to upload
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-center">
                    {tab === "documents"
                      ? "Drop your documents here, or click to select files."
                      : "Drop your images here, or click to select files."}
                  </p>
                  <input
                    type="file"
                    accept={
                      tab === "documents"
                        ? "text/plain,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,application/rtf,application/x-freearc"
                        : "image/jpeg,image/png,image/jpg,image/webp,image/gif,image/bmp"
                    }
                    multiple
                    name={tab}
                    id={tab}
                    aria-label={`Select ${tab}`}
                    ref={fileRef}
                    className="hidden"
                    onChange={handleOnChangeFiles}
                  />
                </div>
              )}
            </>
          ) : (
            // When tab switching is enabled, show tabs with content
            <Tabs
              onValueChange={(value) => {
                onChangeTab(value as "documents" | "images");
              }}
              value={tab}
            >
              <TabsList
                className="self-center mb-4"
                onClick={(e) => e.stopPropagation()}
              >
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              {isDragOver ? (
                <div className="text-center">
                  <p className="text-blue-600 font-medium">
                    Drop files here to upload
                  </p>
                </div>
              ) : (
                <>
                  <FileInput
                    type="documents"
                    fileRef={fileRef}
                    onFileChange={handleOnChangeFiles}
                  />
                  <FileInput
                    type="images"
                    fileRef={fileRef}
                    onFileChange={handleOnChangeFiles}
                  />
                </>
              )}
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadForm;
