import { useRef, useState } from "react";
import DocsInput from "./docs-input";
import ImageInput from "./image-input";
import Seperator from "./seperator";
import axios from "axios";
import toast from "react-hot-toast";

const Upload = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const tab = window.location.search.slice(1).split(";")[0];

  if (tab !== "tab=docs" && tab !== "tab=images") {
    window.location.search = "?tab=docs";
  }

  const file = useRef<HTMLInputElement>(null);

  const uploadFile = () => {
    const files = file.current?.files;

    if (files !== null && files !== undefined) {
      toast.loading("Uploading...");
      const toUpload = files[0];
      const form = new FormData();
      const type = tab === "tab=docs" ? "doc" : "image";
      form.append(type, toUpload);
      axios
        .post<{ url: string }>(`/api/cdn/upload/${type}`, form)
        .then((res) => {
          if (res.status === 200) {
            toast.dismiss();
            toast.success("Successfully uploaded file!");
          }
        })
        .catch((err: Error) => {
          toast.dismiss();
          toast.error(err.message);
        });
    }
  };

  const switchTab = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    tab: "docs" | "images"
  ) => {
    e.preventDefault();
    window.location.search = `?tab=${tab}`;
  };

  return (
    <>
      <h2 className="text-2xl capitalize mb-8">Upload Files</h2>
      <Seperator />
      <div className="border rounded-lg shadow-lg overflow-hidden">
        <nav className="flex justify-evenly h-10 border-b">
          <button
            onClick={(e) => switchTab(e, "docs")}
            className={`w-full h-full flex justify-center items-center ${
              tab === "tab=docs" && "border-b-sky-500 border-b-2"
            }`}
          >
            Documents
          </button>
          <div className="h-10 border-r" />
          <button
            onClick={(e) => switchTab(e, "images")}
            className={`w-full h-full flex justify-center items-center ${
              tab === "tab=images" && "border-b-sky-500 border-b-2"
            }`}
          >
            Images
          </button>
        </nav>
        <form action="">
          {tab === "tab=docs" ? (
            <DocsInput fileRef={file} />
          ) : (
            <ImageInput fileRef={file} />
          )}
          <button
            type="submit"
            className="w-full h-10 bg-sky-300 border-t font-bold disabled:opacity-50"
            onClick={(e) => {
              e.preventDefault();
              uploadFile();
            }}
          >
            Upload File
          </button>
        </form>
      </div>
    </>
  );
};

export default Upload;
