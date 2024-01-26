import { useState } from "react";
import { FileText } from "lucide-react";

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
    <div className="my-8 flex flex-col justify-center items-center h-full">
      <div className="w-full h-full mb-4 flex justify-center items-center">
        {fileNames.length > 0 ? (
          <section className="flex flex-row overflow-hidden">
            {fileNames.map(fileName => (
              <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex flex-col overflow-hidden justify-center items-center">
                <FileText size="128" />
                {fileName}
              </div>
            ))}
          </section>
        ) : (
          <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex justify-center items-center">
            <FileText size="128" />
          </div>
        )}
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
