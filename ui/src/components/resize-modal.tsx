import { queryKeys, useResizeImage, useResizeModal } from "@/hooks/queries";
import { ImageDimensions } from "@/types/imageDimensions";
import { useQueryClient } from "@tanstack/react-query";
import { Scaling } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type ResizeModalProps = {
  filename: string;
};

const ResizeModal: React.FC<ResizeModalProps> = ({ filename }) => {
  const [resizeFormData, setResizeFormData] = useState<ImageDimensions>({
    width: 0,
    height: 0,
  });
  const queryClient = useQueryClient();
  const resizeModal = useResizeModal(filename);
  const fileMetadata = resizeModal.data;

  const resizeFileMutation = useResizeImage({
    onSuccess: () => {
      toast.dismiss();
      const toastId = toast.loading("Processing...");
      toast.success("File resized!", { id: toastId, duration: 1500 });
      queryClient.invalidateQueries({
        queryKey: queryKeys.dimensions(
          resizeFormData.height,
          resizeFormData.width
        ),
      });
    },
    onError: (err: Error) => {
      toast.dismiss();
      const toastId = toast.loading("Processing...");
      toast.error(err.message, { id: toastId, duration: 4000 });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const formattedValue = value.replace(/\D/g, "");
    const positiveIntegerValue =
      formattedValue === "" ? 0 : parseInt(formattedValue, 10);

    setResizeFormData({
      ...resizeFormData,
      [name]: positiveIntegerValue,
    });
  };

  const handleResizeImage = () => {
    const { width, height } = resizeFormData;

    if (!width || !height) {
      toast.error("Width and height are required!");
      return;
    }

    const data = {
      filename,
      width: Math.abs(Math.floor(width)),
      height: Math.abs(Math.floor(height)),
    };

    resizeFileMutation.mutate(data);
  };

  useEffect(() => {
    if (fileMetadata) {
      toast.dismiss();
      setResizeFormData({
        width: fileMetadata.width ?? 0,
        height: fileMetadata.height ?? 0,
      });
    }
  }, [fileMetadata]);

  return (
    <Dialog>
      <DialogTrigger asChild className="text-sky-600">
        <Button size="icon" variant="ghost">
          <Scaling className="inline" size="24" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleResizeImage();
          }}
        >
          <DialogHeader>
            <DialogTitle>Resize image</DialogTitle>
            <DialogDescription>
              Change the height and width of the image. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="height" className="text-right">
                Height
              </Label>
              <Input
                name="height"
                value={resizeFormData.height}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="width" className="text-right">
                Width
              </Label>
              <Input
                name="width"
                value={resizeFormData.width}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResizeModal;
