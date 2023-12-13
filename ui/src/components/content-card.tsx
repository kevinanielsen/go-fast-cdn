import { FileText, Files } from "lucide-react";
import { toast } from "react-hot-toast";

type TContentCardProps = {
  file_name: string;
  type: "images" | "documents";
  ID: number;
  createdAt: Date;
  updatedAt: Date;
};

const ContentCard: React.FC<TContentCardProps> = ({
  file_name,
  type,
  // ID,
  // createdAt,
  // updatedAt,
}) => {
  const url = `${window.location.protocol}//${
    window.location.host
  }/api/cdn/download/${type === "documents" ? "docs" : "images"}/${file_name}`;

  return (
    <div className="border rounded-lg shadow-lg flex flex-col w-64 max-w-[256px] justify-center items-center gap-4 p-4">
      {type === "images" ? (
        <img
          src={url}
          alt={file_name}
          width={200}
          height={150}
          className="object-cover max-h-[150px] max-w-[200px]"
        />
      ) : (
        <FileText />
      )}
      <p className="truncate w-64 px-4">{file_name}</p>
      <div className="flex">
        <button
          className="flex justify-center items-center text-sky-600"
          onClick={() => {
            navigator.clipboard.writeText(url);
            toast.success("clipboard saved");
          }}
        >
          <Files className="inline" size="20" />
          Copy Link
        </button>
      </div>
    </div>
  );
};

export default ContentCard;
