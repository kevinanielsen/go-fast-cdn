import handleResizeImage from "@/actions/handleResizeImage";
import { FileMetadata } from "@/types/fileMetadata";
import { ImageDimensions } from "@/types/imageDimensions";
import axios from "axios";
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const formattedValue = value.replace(/\D/g, '');
    const positiveIntegerValue = formattedValue === '' ? 0 : parseInt(formattedValue, 10);

    setResizeFormData({
      ...resizeFormData,
      [name]: positiveIntegerValue,
    });
  }

  useEffect(() => {
    if (filename) {
      axios
        .get<FileMetadata>(
          `/api/cdn/image/${filename}`
        )
        .then((res) => {
          toast.dismiss();
          if (res.status === 200) {
            setResizeFormData({
                width: res.data.width ?? 0,
                height: res.data.height ?? 0,
            })
          }
        })
        .catch((err) => {
          toast.dismiss();
          toast.error(err.message);
        });
    }
    axios;
  }, [filename]);

  return (
    <Dialog>
      <DialogTrigger asChild className="text-sky-600">
        <Button size="icon" variant="ghost">
          <Scaling className="inline" size="24" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form
          onSubmit={(e) => handleResizeImage(e, resizeFormData, filename)}
        >
          <DialogHeader>
            <DialogTitle>Resize image</DialogTitle>
            <DialogDescription>
              Change the height and width of the image. Click save when you're done.
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
