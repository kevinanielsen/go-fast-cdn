import { useState } from "react";
import UploadPreview from "./upload-preview";

const ImageInput: React.FC<{
  fileRef: React.RefObject<HTMLInputElement>;
}> = ({ fileRef }) => {
  const [fileNames, setFileNames] = useState<string[]>([]);

  const getFileNames = () => {
    if (fileRef.current?.files != null) {
      let names = [];

      for (let file of fileRef.current.files) {
        names.push(file.name);
      }

      setFileNames(names);
    }
  };


  return (
    <div className="my-8 max-h-[691px] flex flex-col justify-center items-center h-full">
      <div className="w-full h-full mb-4 flex justify-center items-center">
        <UploadPreview fileNames={fileNames} type="images"/>
      </div>
      <label htmlFor="image" className="flex flex-col">
        Select Image
        <input
          onChange={getFileNames}
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
