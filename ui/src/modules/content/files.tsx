import ContentCard from "./content-card";
import useGetFilesQuery from "./hooks/use-get-files-query";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import MainContentWrapper from "@/components/layouts/main-content-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

type TFilesProps = {
  type: "images" | "documents";
};

const Files: React.FC<TFilesProps> = ({ type }) => {
  const files = useGetFilesQuery({ type });
  const [search, setSearch] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");

  const filteredFiles = useMemo(() => {
    return files.data?.filter((file) =>
      file.file_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [files.data, search]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDebounceSearch(event.target.value);
    },
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(debounceSearch);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [debounceSearch]);

  return (
    <MainContentWrapper title={type}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Input
            className="w-full max-w-xs"
            placeholder="Search files by name"
            value={debounceSearch}
            onChange={handleSearchChange}
            aria-label="Search users"
          />
          <Button
            variant="outline"
            className={cn({
              hidden: !search,
            })}
            onClick={() => {
              setSearch("");
              setDebounceSearch("");
            }}
            aria-label="Clear search"
          >
            <X />
            Clear Search
          </Button>
        </div>
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
              {filteredFiles?.map((file) => (
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
      </div>
    </MainContentWrapper>
  );
};

export default Files;
