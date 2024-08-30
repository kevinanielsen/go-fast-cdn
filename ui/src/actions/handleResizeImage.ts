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

  toast.loading("Renaming file...");
  axios.put(`/api/cdn/resize/image`, JSON.stringify(data)).then((res) => {
    if (res.status === 200) {
      toast.dismiss();
      toast.success("File resized!");

      setTimeout(() => {
        location.reload();
      }, 1500)
    }
  }).catch((err) => {
    toast.dismiss();
    toast.error("Error: " + err.response.data);
  })
}

export default handleResizeImage