import { X } from "lucide-react";

interface ImageCardUploadProps {
  imageUrl: string;
  onClickDelete: () => void;
  fileName?: string;
}
const ImageCardUpload = ({
  imageUrl,
  onClickDelete,
  fileName,
}: ImageCardUploadProps) => {
  return (
    <div className="relative w-32">
      <img src={imageUrl} alt={fileName} className="w-full h-full" />
      <button
        onClick={onClickDelete}
        className="absolute top-1 right-1 bg-background/30 rounded-xs text-foreground cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ImageCardUpload;
