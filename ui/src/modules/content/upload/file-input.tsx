import { TabsContent } from "@/components/ui/tabs";
import React from "react";

interface FileInputProps {
  type: "documents" | "images";
  fileRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const FileInput = ({ type, fileRef, onFileChange }: FileInputProps) => {
  const ACCEPT_TYPES = {
    documents:
      "text/plain,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,application/rtf,application/x-freearc",
    images: "image/jpeg,image/png,image/jpg,image/webp,image/gif,image/bmp",
  } as const;
  const UPLOAD_MESSAGES = {
    documents: "Drop your documents here, or click to select files.",
    images: "Drop your images here, or click to select files.",
  } as const;

  return (
    <TabsContent value={type}>
      <p className="text-gray-500 text-center">{UPLOAD_MESSAGES[type]}</p>
      <input
        type="file"
        accept={ACCEPT_TYPES[type]}
        multiple
        name={type}
        id={type}
        aria-label={`Select ${type}`}
        ref={fileRef}
        className="hidden"
        onChange={onFileChange}
      />
    </TabsContent>
  );
};

export default FileInput;
