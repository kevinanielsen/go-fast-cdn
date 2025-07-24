export type TFile = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  file_name: string;
  checksum: string;
};
