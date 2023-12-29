import { useAtom } from "jotai";
import { sizeAtom, sizeLoadingAtom } from "../store";
import { useEffect } from "react";
import { getSize } from "../actions/getSize";

const ContentSize = () => {
  const [size, setSize] = useAtom(sizeAtom);
  const [loading, setLoading] = useAtom(sizeLoadingAtom);

  useEffect(() => {
    getSize(setSize, setLoading);
  }, [setSize, setLoading]);

  if (loading)
    return (
      <div className="bottom-0 absolute mb-4">
        <span>Total content size:</span>
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="bottom-0 absolute mb-4">
      <span data-testid="content-size-label">Total content size:</span>
      <p className="font-bold" data-testid="content-size">
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
