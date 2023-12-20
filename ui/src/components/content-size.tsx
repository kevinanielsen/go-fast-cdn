import { SetStateAction, useAtom } from "jotai";
import { sizeAtom } from "../store";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SetAtom<Args extends any[], Result> = (...args: Args) => Result;

const getSize = (
  setSize: SetAtom<[SetStateAction<number>], void>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setLoading(true);
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
      setLoading(false);
    });
};

const ContentSize = () => {
  const [size, setSize] = useAtom(sizeAtom);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSize(setSize, setLoading);
  }, [setSize]);

  if (loading)
    return (
      <div className="bottom-0 absolute mb-4">
        <span>Total content size:</span>
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="bottom-0 absolute mb-4">
      <span>Total content size:</span>
      <p className="font-bold">
        {size < 1000 && `${size} b`}
        {999999 > size && size >= 1000 && `${Math.round(size / 100) / 10} KB`}
        {1000000000 > size &&
          size >= 1000000 &&
          `${Math.round(size / 100000) / 10} MB`}
        {1000000000000 > size &&
          size >= 1000000000 &&
          `${Math.round(size / 100000000) / 10} GB`}
        {size >= 1000000000000 && `${Math.round(size / 100000000000) / 10} TB`}
      </p>
    </div>
  );
};

export default ContentSize;
