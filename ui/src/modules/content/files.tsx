import ContentCard from "./content-card";
import useGetFilesQuery from "./hooks/use-get-files-query";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { List, Trash, X } from "lucide-react";
import { cn } from "@/lib/utils";
import MainContentWrapper from "@/components/layouts/main-content-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import useDeleteFileMutation from "./hooks/use-delete-file-mutation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { constant } from "@/lib/constant";
import { AxiosError } from "axios";
import { IErrorResponse } from "@/types/response";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import UploadModal from "./upload/upload-modal";

type TFilesProps = {
  type: "images" | "documents";
};

const Files: React.FC<TFilesProps> = ({ type }) => {
  const files = useGetFilesQuery({ type });
  const [search, setSearch] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const deleteMutation = useDeleteFileMutation(
    type === "documents" ? "doc" : "image"
  );

  const queryClient = useQueryClient();

  const {
    mutateAsync: deleteFilesMutation,
    isPending: isDeletingFilesLoading,
  } = useMutation({
    mutationFn: () =>
      Promise.all(
        selectedFiles.map((fileName) => deleteMutation.mutateAsync(fileName))
      ),
    onSuccess: () => {
      setSelectedFiles([]);
      setIsSelecting(false);
      queryClient.invalidateQueries({
        queryKey: constant.queryKeys.images(type),
      });
    },
    onError: (error) => {
      const errorResponse = error as AxiosError<IErrorResponse>;
      const message = errorResponse.response?.data?.error || "Delete failed";
      toast.error(message);
    },
  });

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

  const handleOnSelectFile = useCallback(
    (fileName: string) => {
      if (selectedFiles.includes(fileName)) {
        setSelectedFiles((prev) => prev.filter((name) => name !== fileName));
      } else {
        setSelectedFiles((prev) => [...prev, fileName]);
      }
    },
    [selectedFiles]
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
        <div className="flex items-center justify-between">
          <section className="flex items-center gap-2">
            <Input
              className="w-full max-w-md min-w-xs"
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
          </section>
          <section className="flex items-center gap-2">
            {isSelecting ? (
              <>
                <Button
                  onClick={() => {
                    setIsSelecting(false);
                    setSelectedFiles([]);
                  }}
                  variant="outline"
                  disabled={isDeletingFilesLoading}
                >
                  <X />
                  {selectedFiles.length}
                  {selectedFiles.length === 1
                    ? " File Selected"
                    : " Files Selected"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={
                        selectedFiles.length === 0 || isDeletingFilesLoading
                      }
                    >
                      <Trash />
                      Delete Selected Files
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to delete these files?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All selected files will be
                        permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className={buttonVariants({
                          variant: "destructive",
                        })}
                        onClick={() => deleteFilesMutation()}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <>
                <Button onClick={() => setIsSelecting(true)} variant="outline">
                  <List />
                  Select
                </Button>
                <UploadModal placement="header" type={type} />
              </>
            )}
          </section>
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
                  isSelecting={isSelecting}
                  isSelected={selectedFiles.includes(file.file_name)}
                  onSelect={handleOnSelectFile}
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
