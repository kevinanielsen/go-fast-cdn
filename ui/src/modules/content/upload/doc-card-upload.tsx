import { X } from "lucide-react";

interface DocCardUploadProps {
  fileName: string;
  onClickDelete: () => void;
}
const DocCardUpload = ({ fileName, onClickDelete }: DocCardUploadProps) => {
  return (
    <div className="bg-zinc-200 py-1 px-2 rounded-sm text-xs truncate inline-flex">
      <span>{fileName}</span>
      <button onClick={onClickDelete} className="ml-2 text-muted-foreground">
        <X size={16} />
      </button>
    </div>
  );
};

export default DocCardUpload;
