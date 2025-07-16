import { SquarePen } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import useRenameFileMutation from "./hooks/use-rename-file-mutation";
import { constant } from "@/lib/constant";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type RenameModalProps = {
  filename?: string;
  type: "images" | "documents";
};

const RenameModal: React.FC<RenameModalProps> = ({ filename, type }) => {
  const [newFilename, setNewFilename] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const renameFileMutation = useRenameFileMutation(
    type === "documents" ? "doc" : "image",
    {
      onSuccess: () => {
        toast.success("Renamed file!", {
          duration: 200000,
        });
        setIsOpen(false);
        queryClient.invalidateQueries({
          queryKey: constant.queryKeys.images(
            type === "images" ? "images" : "documents"
          ),
        });
      },
      onError: (err) => {
        toast.dismiss();
        toast.error("Error: " + err.message);
      },
    }
  );

  const handleRenameFile = () => {
    const fileExt = filename?.split(".").pop();

    if (newFilename.length === 0) {
      toast.error("New filename empty!");
      return;
    }

    if (typeof filename === "undefined") return;

    const form = new FormData();
    form.append("filename", filename);
    form.append("newname", newFilename + "." + fileExt);

    renameFileMutation.mutate(form);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipTrigger>
            <Button size="icon" variant="ghost" className="text-sky-600">
              <SquarePen />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Rename {type === "images" ? "Image" : "Document"}</p>
          </TooltipContent>
        </Tooltip>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRenameFile();
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
              Change the name of the file. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                Filename
              </Label>
              <Input
                id="filename"
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={renameFileMutation.isPending} type="submit">
              {renameFileMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameModal;
