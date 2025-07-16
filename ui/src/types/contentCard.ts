export type TContentCardProps = {
  file_name: string;
  type?: "images" | "documents";
  ID?: number;
  createdAt: string;
  updatedAt: string;
  disabled?: boolean;
  isSelected?: boolean;
  onSelect?: (fileName: string) => void;
  isSelecting?: boolean;
};
