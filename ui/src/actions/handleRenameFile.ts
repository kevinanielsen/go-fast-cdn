import axios from "axios";
import toast from "react-hot-toast";

const handleRenameFile = (
  newFilename: string,
  filename?: string,
  type?: string
) => {
  const fileExt = filename?.split(".").pop();

  if (newFilename.length === 0) {
    toast.error("New filename empty!");
    return;
  }

  if (typeof filename === "undefined") return;

  const form = new FormData();
  form.append("filename", filename);
  form.append("newname", newFilename + "." + fileExt);

  toast.loading("Renaming file...");

  axios
    .put(`/api/cdn/rename/${type === "documents" ? "doc" : "image"}`, form)
    .then((res) => {
      if (res.status === 200) {
        toast.dismiss();
        toast.success("Renamed file!");
        location.reload();
      }
    })
    .catch((err) => {
      toast.dismiss();
      toast.error("Error: " + err.response.data);
    });
};

export default handleRenameFile;
