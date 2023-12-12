import { useEffect, useState } from "react";
import axios from "axios";
import File from "../types/file";
import ContentCard from "./content-card";
import Seperator from "./seperator";

type TFilesProps = {
  type: "images" | "documents";
};

const Files: React.FC<TFilesProps> = ({ type }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(
        `http://localhost:8080/api/${type === "images" ? "image" : "doc"}/all`
      )
      .then((res) => res.data != null && setFiles(res.data))
      .catch((err: undefined) => {
        console.log(err);
      })
      .finally(() => setIsLoading(false));
  }, [type]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
