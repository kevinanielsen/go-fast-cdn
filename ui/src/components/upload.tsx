import { useUploadFile } from "@/queries";
import { sanitizeFileName } from "@/utils";
import { useRef } from "react";
import { useParams } from "wouter";
import DocsInput from "./docs-input";
import ImageInput from "./image-input";
import Seperator from "./seperator";

const Upload = () => {
  const tab = useParams<{ tab: "images" | "docs" }>().tab;

  if (tab === undefined || tab === null) {
    window.location.pathname = "/upload/docs";
  }

  const file = useRef<HTMLInputElement>(null);
  const type = tab === "docs" ? "doc" : "image";
  const uploadFileMutation = useUploadFile(type);

  const handleUploadFile = async () => {
    const files = file.current?.files;

    if (!files) return;

    for (const file of files) {
      const sanitizedFile = sanitizeFileName(file);
      uploadFileMutation.mutate(sanitizedFile);
    }
  };

  const switchTab = (tab: "docs" | "images") => {
    window.location.pathname = `upload/${tab}`;
  };

  return (
    <>
      <h2 className="text-2xl capitalize mb-8">Upload Files</h2>
      <Seperator />
      <div className="border rounded-lg shadow-lg h-full overflow-hidden flex flex-col">
        <nav className="flex justify-evenly h-10 border-b">
          <button
            onClick={() => switchTab("docs")}
            className={`w-full h-full flex justify-center items-center ${
              tab === "docs" && "border-b-sky-500 border-b-2"
            }`}
          >
            Documents
          </button>
          <div className="h-10 border-r" />
          <button
            onClick={() => switchTab("images")}
            className={`w-full h-full flex justify-center items-center ${
              tab === "images" && "border-b-sky-500 border-b-2"
            }`}
          >
            Images
          </button>
        </nav>
        <form
          action=""
          className="flex flex-col h-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleUploadFile();
          }}
        >
          {tab === "docs" ? (
            <DocsInput fileRef={file} />
          ) : (
            <ImageInput fileRef={file} />
          )}
          <button
            type="submit"
            className="w-full h-10 bg-sky-400 border-t font-bold disabled:opacity-50 py-4 flex justify-center items-center"
          >
            Upload File
          </button>
        </form>
      </div>
    </>
  );
};

export default Upload;
