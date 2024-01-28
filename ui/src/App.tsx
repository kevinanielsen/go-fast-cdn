import { Link, Route } from "wouter";
import { Toaster } from "react-hot-toast";
import Files from "./components/files";
import { Image, Upload as UploadIcon, Files as FilesIcon } from "lucide-react";
import Seperator from "./components/seperator";
import Upload from "./components/upload";
import ContentSize from "./components/content-size";

function App() {
  return (
    <>
      <Toaster />
      <div className="flex max-h-screen w-screen">
        <nav className="min-w-[256px] min-h-screen h-full border-r shadow-lg pt-4 px-4 flex flex-col">
          <h1 className="text-xl font-bold">Go-Fast CDN</h1>
          <Seperator />
          <Link to="/upload" className="flex font-bold gap-4 items-center">
            <UploadIcon />
            Upload Content
          </Link>
          <Seperator />
          <h3 className="text-lg mb-4 font-bold">Content</h3>
          <ul className="flex flex-col gap-4">
            <li>
              <Link to="/images" className="flex font-bold gap-4 items-center">
                <Image />
                Images
              </Link>
            </li>
            <li>
              <Link
                to="/documents"
                className="flex font-bold gap-4 items-center"
              >
                <FilesIcon />
                Documents
              </Link>
            </li>
          </ul>
          <ContentSize />
        </nav>
        <main className="m-4 h-auto flex flex-col w-full">
          <Route path="/images">{<Files type="images" />}</Route>
          <Route path="/documents">{<Files type="documents" />}</Route>
          <Route path="/upload">{<Upload />}</Route>
          <Route path="/upload/:tab">{<Upload />}</Route>
        </main>
      </div>
    </>
  );
}

export default App;
