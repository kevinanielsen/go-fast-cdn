import { useGetFileData } from "@/hooks/queries";
import Seperator from "./seperator";
import { DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

type TFileDataModalProps = {
  filename: string;
  type: "images" | "documents";
};

const FileDataModal: React.FC<TFileDataModalProps> = ({ filename, type }) => {
  const fileData = useGetFileData({ filename, type });

  if (!fileData.data)
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
        <p id="filename">{fileData.data.filename}</p>
      </div>
      <div className="">
        <strong>File Size</strong>
        <p id="filename">
          {fileData.data.file_size < 1000 && `${fileData.data.file_size} b`}
          {999999 > fileData.data.file_size &&
            fileData.data.file_size >= 1000 &&
            `${Math.round(fileData.data.file_size / 100) / 10} KB`}
          {1000000000 > fileData.data.file_size &&
            fileData.data.file_size >= 1000000 &&
            `${Math.round(fileData.data.file_size / 100000) / 10} MB`}
          {1000000000000 > fileData.data.file_size &&
            fileData.data.file_size >= 1000000000 &&
            `${Math.round(fileData.data.file_size / 100000000) / 10} GB`}
          {fileData.data.file_size >= 1000000000000 &&
            `${Math.round(fileData.data.file_size / 100000000000) / 10} TB`}
        </p>
      </div>
      {type === "images" && (
        <div className="">
          <strong>Dimensions</strong>
          <p id="filename">Height: {fileData.data.height}px</p>
          <p id="filename">Width: {fileData.data.width}px</p>
        </div>
      )}
    </DialogContent>
  );
};

export default FileDataModal;
