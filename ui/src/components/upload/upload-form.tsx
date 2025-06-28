import { sanitizeFileName } from "@/utils";
import { useCallback, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";
import DocCardUpload from "../doc-card-upload";
import ImageCardUpload from "./image-card-upload";
import FileInput from "./file-input";

interface UploadProps {
  files: File[];
  onChangeFiles: (files: File[]) => void;
  isLoading: boolean;
  tab: "documents" | "images";
  onChangeTab: (tab: "documents" | "images") => void;
}
const UploadForm = ({
  isLoading,
  files,
  onChangeFiles,
  onChangeTab,
  tab,
}: UploadProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

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

  return (
    <div
      id="drop-zone"
      className={cn(
        "w-full h-96 border-2 border-dashed rounded-md border-zinc-300",
        {
          "cursor-pointer": files.length === 0,
        }
      )}
      onClick={() => {
        if (fileRef.current && files.length === 0 && !isLoading) {
          fileRef.current.click();
        }
      }}
    >
      {files.length > 0 ? (
        <div className="flex gap-2 flex-wrap p-2">
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
          <Tabs
            onValueChange={(value) => {
              onChangeTab(value as "documents" | "images");
            }}
            value={tab}
          >
            <TabsList
              className="self-center"
              onClick={(e) => e.stopPropagation()}
            >
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>
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
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
