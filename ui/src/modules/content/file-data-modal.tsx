import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useGetFileDataQuery from "./hooks/use-get-file-data-query";

type TFileDataModalProps = {
  filename: string;
  type: "images" | "documents";
};

const FileDataModal: React.FC<TFileDataModalProps> = ({ filename, type }) => {
  const fileData = useGetFileDataQuery({ filename, type });

  if (!fileData.data)
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{filename}</DialogTitle>
        </DialogHeader>
        Error fetching file data.
      </DialogContent>
    );
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{filename}</DialogTitle>
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
