import ContentCard from "./content-card";
import { Skeleton } from "../../ui/skeleton";
import MainContentWrapper from "../../layouts/main-content-wrapper";
import useGetFilesQuery from "./hooks/use-get-files-query";

type TFilesProps = {
  type: "images" | "documents";
};

const Files: React.FC<TFilesProps> = ({ type }) => {
  const files = useGetFilesQuery({ type });

  return (
    <MainContentWrapper title={type}>
      <div className="flex flex-wrap gap-4">
        {files.isLoading ? (
          <>
            <Skeleton className="min-h-[264px] w-64 max-w-[256px]" />
            <Skeleton className="min-h-[264px] w-64 max-w-[256px]" />
            <Skeleton className="min-h-[264px] w-64 max-w-[256px]" />
            <Skeleton className="min-h-[264px] w-64 max-w-[256px]" />
            <Skeleton className="min-h-[264px] w-64 max-w-[256px]" />
            <Skeleton className="min-h-[264px] w-64 max-w-[256px]" />
          </>
        ) : (
          <>
            {files.data?.map((file) => (
              <ContentCard
                type={type}
                file_name={file.file_name}
                ID={file.ID}
                createdAt={file.CreatedAt}
                updatedAt={file.UpdatedAt}
                key={file.ID}
              />
            ))}
          </>
        )}
      </div>
    </MainContentWrapper>
  );
};

export default Files;
