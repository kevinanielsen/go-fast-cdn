import { useGetSize } from "@/hooks/queries";

const ContentSize = () => {
  const size = useGetSize();

  if (size.isLoading)
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
        {size.data < 1000 && `${size.data} b`}
        {999999 > size.data &&
          size.data >= 1000 &&
          `${Math.round(size.data / 100) / 10} KB`}
        {1000000000 > size.data &&
          size.data >= 1000000 &&
          `${Math.round(size.data / 100000) / 10} MB`}
        {1000000000000 > size.data &&
          size.data >= 1000000000 &&
          `${Math.round(size.data / 100000000) / 10} GB`}
        {size.data >= 1000000000000 &&
          `${Math.round(size.data / 100000000000) / 10} TB`}
      </p>
    </div>
  );
};

export default ContentSize;
