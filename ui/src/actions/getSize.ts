import axios from "axios";
import { SetStateAction } from "jotai";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetAtom<Args extends any[], Result> = (...args: Args) => Result;

export const getSize = (
  setSize: SetAtom<[SetStateAction<number>], void>,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setLoading && setLoading(true);
  axios
    .get<{ cdn_size_bytes: number }>("/api/cdn/size")
    .then((res) => {
      setSize(res.data.cdn_size_bytes);
    })
    .catch((err) => {
      toast.error("Error getting content size");
      console.log(err);
    })
    .finally(() => {
      setLoading && setLoading(false);
    });
};
