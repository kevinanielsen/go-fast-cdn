import { ImageDimensions } from "@/types/imageDimensions";
import axios from "axios";
import { FormEvent } from "react";
import toast from "react-hot-toast";

const handleResizeImage = (e: FormEvent, newDimensions: ImageDimensions, filename: string) => {
  e.preventDefault();
  
  const {width, height} = newDimensions;

  if(!width || !height) {
    toast.error("Width and height are required!")
    return;
  }

  const data = {
    filename,
    width: Math.abs(Math.floor(width)),
    height: Math.abs(Math.floor(height))
  };

  const toastId = toast.loading("Renaming file...");
  axios.put(`/api/cdn/resize/image`, JSON.stringify(data)).then((res) => {
    if (res.status === 200) {
      toast.success("File resized!", { id: toastId, duration: 1500 });

      setTimeout(() => {
        location.reload();
      }, 1500)
    }
  }).catch((err) => {
    toast.error("Error: " + err.response.data, { id: toastId, duration: 4000 });
  })
}

export default handleResizeImage