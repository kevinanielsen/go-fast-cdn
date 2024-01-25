import { FileImage } from "lucide-react";
import { useState } from "react";

const ImageInput: React.FC<{
  fileRef: React.RefObject<HTMLInputElement>;
}> = ({ fileRef }) => {
  const [fileName, setFileName] = useState<undefined | string>(undefined);

  const getFileName = () => {
    if (fileRef.current?.files != null) {
      setFileName(fileRef.current.files[0].name);
    }
  };

  return (
    <div className="my-8 flex flex-col justify-center items-center h-full">
      <div className="w-full h-full mb-4 flex justify-center items-center">
        {fileName ? (
          <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex flex-col justify-center overflow-hidden items-center">
            <FileImage size="128" />
            {fileName}
          </div>
        ) : (
          <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex justify-center items-center">
            <FileImage size="128" />
          </div>
        )}
      </div>
      <label htmlFor="image" className="flex flex-col">
        Select Image
        <input
          onChange={getFileName}
          type="file"
          accept="image/jpeg, image/png, image/jpg, image/webp, image/gif, image/bmp"
          multiple
          name="image"
          id="image"
          aria-label="Select image"
          ref={fileRef}
        />
      </label>
    </div>
  );
};

export default ImageInput;
