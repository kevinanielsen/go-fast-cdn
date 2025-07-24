import { Loader2Icon, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sanitizeFileName } from "@/utils";
import UploadForm from "./upload-form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import useUploadFileMutation from "../hooks/use-upload-file-mutation";
import { AxiosError } from "axios";
import { IErrorResponse } from "@/types/response";
import toast from "react-hot-toast";
import { constant } from "@/lib/constant";

type ConditionalUploadModalProps =
  | { placement: "header"; type: "documents" | "images" }
  | { placement?: "sidebar"; type?: "documents" | "images" };

const UploadModal = ({
  placement = "sidebar",
  type,
}: ConditionalUploadModalProps) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Set initial tab based on type when placement is header, otherwise default to documents
  const [tab, setTab] = useState<"documents" | "images">(
    placement === "header" && type ? type : "documents"
  );

  const uploadFileMutation = useUploadFileMutation();

  const handleReset = useCallback(() => {
    setFiles([]);

    // Reset tab to initial value based on placement and type
    const initialTab = placement === "header" && type ? type : "documents";
    setTab(initialTab);
    setOpen(false);
    uploadFileMutation.reset();
  }, [uploadFileMutation, placement, type]);

  const queryClient = useQueryClient();

  const { mutate: uploadFileMutate, isPending: isUploadPending } = useMutation({
    mutationFn: async () => {
      return Promise.all(
        files.map((file) => {
          const sanitizedFile = sanitizeFileName(file);
          return uploadFileMutation.mutateAsync({
            file: sanitizedFile,
            type: tab === "documents" ? "doc" : "image",
          });
        })
      );
    },
    onSuccess: async () => {
      toast.success("Successfully uploaded file!");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: constant.queryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: [constant.queryKeys.dashboard],
        }),
      ]);
      handleReset();
    },
    onError: (error) => {
      const err = error as AxiosError<IErrorResponse>;
      const message = err.response?.data?.error || "Upload failed";
      toast.error(message);
    },
  });

  const handleUpload = useCallback(() => {
    if (files.length === 0) {
      return;
    }
    uploadFileMutate();
  }, [files, uploadFileMutate]);

  return (
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        {placement === "header" ? (
          <Button onClick={() => {}} variant="default">
            <Plus />
            Add {type === "images" ? "Image" : "Document"}
          </Button>
        ) : (
          <SidebarGroupAction title="Add Content">
            <Plus /> <span className="sr-only">Add Content</span>
          </SidebarGroupAction>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload your files here and manage your content easily.
          </DialogDescription>
        </DialogHeader>

        <UploadForm
          isLoading={isUploadPending}
          tab={tab}
          onChangeTab={setTab}
          files={files}
          onChangeFiles={setFiles}
          disableTabSwitching={placement === "header"}
        />

        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button
              onClick={handleReset}
              type="button"
              variant="secondary"
              disabled={isUploadPending}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={isUploadPending}
            type="button"
            variant="default"
            onClick={handleUpload}
          >
            {isUploadPending ? (
              <>
                <Loader2Icon className="animate-spin" />
                Please wait
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;
