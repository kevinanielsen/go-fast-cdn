import { useEffect, useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import axios from "axios";
import toast from "react-hot-toast";
import { FileMetadata } from "@/types/fileMetadata";
import Seperator from "./seperator";

type TFileDataModalProps = {
  filename?: string;
  type?: "images" | "documents";
};

const FileDataModal: React.FC<TFileDataModalProps> = ({ filename, type }) => {
  const [data, setData] = useState<FileMetadata>();
  useEffect(() => {
    if (filename && type) {
      axios
        .get<FileMetadata>(
          `/api/cdn/${type === "documents" ? "doc" : "image"}/${filename}`
        )
        .then((res) => {
          toast.dismiss();
          if (res.status === 200) {
            setData(res.data);
          }
        })
        .catch((err) => {
          toast.dismiss();
          toast.error(err.message);
        });
    }
    axios;
  }, [filename, type]);
  if (!data)
    return (
      <DialogContent className="overflow-hidden">
        <DialogHeader>
          <DialogTitle>{filename}</DialogTitle>
        </DialogHeader>
        Error fetching file data.
      </DialogContent>
    );
  return (
    <DialogContent className="overflow-clip">
      <DialogHeader className="w-[90%]">
        <DialogTitle className="truncate">{filename}</DialogTitle>
        <Seperator />
      </DialogHeader>

      <div className="">
        <strong>Filename</strong>
        <p id="filename">{data.filename}</p>
      </div>
      <div className="">
        <strong>File Size</strong>
        <p id="filename">
          {data.file_size < 1000 && `${data.file_size} b`}
          {999999 > data.file_size && data.file_size >= 1000 && `${Math.round(data.file_size / 100) / 10} KB`}
          {1000000000 > data.file_size &&
            data.file_size >= 1000000 &&
            `${Math.round(data.file_size / 100000) / 10} MB`}
          {1000000000000 > data.file_size &&
            data.file_size >= 1000000000 &&
            `${Math.round(data.file_size / 100000000) / 10} GB`}
          {data.file_size >= 1000000000000 &&
            `${Math.round(data.file_size / 100000000000) / 10} TB`}
        </p>
      </div>
      {type === "images" && (
        <div className="">
          <strong>Dimensions</strong>
          <p id="filename">Height: {data.height}px</p>
          <p id="filename">Width: {data.width}px</p>
        </div>

      )}
    </DialogContent>
  );
};

export default FileDataModal;
