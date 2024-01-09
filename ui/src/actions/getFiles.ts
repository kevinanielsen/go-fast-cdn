import axios from "axios";
import { SetStateAction } from "jotai";
import toast from "react-hot-toast";
import File from "../types/file";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetAtom<Args extends any[], Result> = (...args: Args) => Result;

export const getFiles = (
  type: "images" | "documents",
  setFiles: SetAtom<[SetStateAction<File[]>], void>,
) => {
  toast.loading("Loading files...");
  axios
    .get(`/api/cdn/${type === "images" ? "image" : "doc"}/all`)
    .then((res) => res.data != null && setFiles(res.data))
    .catch((err: Error) => {
      toast.dismiss();
      toast.error(err.message);
      console.log(err);
    })
    .finally(() => toast.dismiss());
}

