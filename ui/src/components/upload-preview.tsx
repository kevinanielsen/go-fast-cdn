import { FileText } from "lucide-react";
import { FileImage } from "lucide-react";

const UploadPreview = ({fileNames, type}: {fileNames: string[], type: string}) => {
  if (fileNames.length >= 7) {
    return (
      <ul className="list-columns">
        {fileNames.map(fileName => (
          <li>{fileName}</li>
        ))}
      </ul>
    );
  } else if (fileNames.length > 0) {
    return (
      <section className="flex flex-row overflow-hidden">
        {fileNames.map(fileName => (
          <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex flex-col overflow-hidden justify-center items-center">
            {type == "docs" ? <FileText size="128" /> : <FileImage size="128" />}
            {fileName}
          </div>
        ))}
      </section>
    );
  } else {
    return (
      <div className="border rounded-lg w-64 min-h-[264px] max-w-[256px] flex justify-center items-center">
        {type == "docs" ? <FileText size="128" /> : <FileImage size="128" />}
      </div>
    );
  }
};

export default UploadPreview;