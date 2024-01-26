import { FileImage } from "lucide-react";
import { useState } from "react";

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
    <div className="my-8 flex flex-col justify-center items-center h-full">
      <div className="w-full h-full mb-4 flex justify-center items-center">
        {fileNames.length > 0 ? (
          <section className="flex flex-row overflow-hidden">
            {fileNames.map(fileName => (
              <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex flex-col justify-center overflow-hidden items-center">
                <FileImage size="128" />
                {fileName}
              </div>
            ))}
          </section>
        ) : (
          <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex justify-center items-center">
            <FileImage size="128" />
          </div>
        )}
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
