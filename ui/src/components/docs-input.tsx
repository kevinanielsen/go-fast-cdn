import { useState } from "react";
import { FileText } from "lucide-react";

const DocsInput: React.FC<{
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
          <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex flex-col overflow-hidden justify-center items-center">
            <FileText size="128" />
            {fileName}
          </div>
        ) : (
          <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex justify-center items-center">
            <FileText size="128" />
          </div>
        )}
      </div>
      <label htmlFor="document" className="flex flex-col">
        Select Document
        <input
          onChange={getFileName}
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
