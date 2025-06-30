import { useGetFiles } from "../queries";
import ContentCard from "./content-card";
import Seperator from "./seperator";

type TFilesProps = {
  type: "images" | "documents";
};

const Files: React.FC<TFilesProps> = ({ type }) => {
  const files = useGetFiles({ type });

  return (
    <div className="w-full">
      <h2 className="text-2xl capitalize mb-8">{type}</h2>
      <Seperator />
      <div className="flex flex-wrap gap-4">
        {files.data?.map((file) => (
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
