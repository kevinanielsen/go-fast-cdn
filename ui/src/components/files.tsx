import { useEffect } from "react";
import ContentCard from "./content-card";
import Seperator from "./seperator";
import { useAtom } from "jotai";
import { filesAtom } from "../store";
import { getFiles } from "../actions/getFiles";

type TFilesProps = {
  type: "images" | "documents";
};

const Files: React.FC<TFilesProps> = ({ type }) => {
  const [files, setFiles] = useAtom(filesAtom);

  useEffect(() => {
    getFiles(type, setFiles)
  }, [type, setFiles]);

  return (
    <div className="w-full">
      <h2 className="text-2xl capitalize mb-8">{type}</h2>
      <Seperator />
      <div className="flex flex-wrap gap-4">
        {files.map((file) => (
          <ContentCard
            type={type}
            file_name={file.file_name}
            ID={file.ID}
            createdAt={file.createdAt}
            updatedAt={file.updatedAt}
            key={file.ID}
          />
        ))}
      </div>
    </div>
  );
};

export default Files;
