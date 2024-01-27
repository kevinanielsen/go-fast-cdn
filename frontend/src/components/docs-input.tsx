import { useState } from "react";
import UploadPreview from "./upload-preview";

const DocsInput: React.FC<{
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
    <div className="my-8 flex max-h-[691px] flex-col justify-center items-center h-full">
      <div className="w-full h-full mb-4 flex justify-center items-center overflow-hidden">
        <UploadPreview fileNames={fileNames} type="docs"/>
      </div>
      <label htmlFor="document" className="flex flex-col">
        Select Document
        <input
          onChange={getFileNames}
          type="file"
          accept="text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/pdf, application/rtf, application/x-freearc"
          multiple
          name="document"
          id="document"
          aria-label="Select document"
          ref={fileRef}
        />
      </label>
    </div>
  );
};

export default DocsInput;
