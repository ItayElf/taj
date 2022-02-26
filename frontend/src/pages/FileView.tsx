import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight";
import { atelierDuneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Footer from "../component/Footer";
import Header from "../component/Header";
import NotFound from "../component/NotFound";
import { apiUrl } from "../constants";
import { get, post } from "../utils/fetchUtils";
import { getBytesSize, useQuery } from "../utils/funcs";
import { FileMetadata } from "../utils/interfaces";
import JsFileDownloader from "js-file-downloader";

export function FileView() {
  const [fileData, setFileData] = useState<FileMetadata | null | undefined>(
    null
  );
  const { repo } = useParams();
  const map = require("lang-map");
  const query = useQuery();
  const file = query.get("file") ?? "";
  const ext = file.split(".").pop() ?? "";
  let dirArr = file.split("/");
  dirArr = [repo ?? "", ...dirArr];
  const last = dirArr[dirArr.length - 1];
  dirArr.pop();
  const imgs = ["png", "jpg", "jpeg", "bmp"];

  useEffect(() => {
    async function getFile() {
      const res = await get(apiUrl + `repos/${repo}/file/${file}`, {});
      try {
        setFileData(JSON.parse(await res.text()) as FileMetadata);
      } catch (e) {
        setFileData(undefined);
        return;
      }
    }
    getFile();
  }, [file, repo]);

  async function download() {
    // const res = await get(apiUrl + `repos/${repo}/file/${file}`, {});
    // const blob = await res.blob();
    new JsFileDownloader({ url: apiUrl + `repos/${repo}/download/${file}` });
  }

  if (fileData === null) {
    return (
      <div>
        <Header />
        <div className="h-full-main flex items-center justify-center">
          <div>
            <div className="border-primary h-24 w-24 animate-spin rounded-full border-8 border-solid [border-top-color:transparent]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  } else if (file === "" || fileData === undefined) {
    return (
      <div>
        <Header />
        <NotFound className="h-full-main" />
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-full-main px-20 pt-10">
        <div className="container">
          <div className="flex justify-between">
            <button className="bg-secondary hover:bg-secondary/80 text-primary-dark block rounded py-2 px-4 text-center font-bold">
              COMMITNAME
            </button>
            {/* // TODO: add dropdown with commits */}
            <div className="flex text-3xl">
              {dirArr.map((d, i) => (
                <div key={i}>
                  <Link
                    to={
                      i === 0
                        ? `/repo/${repo}`
                        : `/repo/${repo}?dir=${
                            dirArr.slice(1, i + 1).join("/") + "/"
                          }`
                    }
                    className="text-primary"
                  >
                    {d}
                  </Link>
                  <span>/</span>
                </div>
              ))}
              <span>{last}</span>
            </div>
            <button
              onClick={download}
              className="bg-primary hover:bg-primary/80 block rounded py-2 px-4 text-center font-bold text-white"
            >
              Download
            </button>
            {/* TODO: download */}
          </div>
          <div className="border-secondary mt-6 rounded border">
            <div className="bg-secondary divide-secondary-semi-dark flex divide-x py-2 px-4">
              {!fileData.binary && (
                <span className="pr-2">{fileData.lines} lines</span>
              )}
              <span className={fileData.binary ? "" : "pl-2"}>
                {getBytesSize(fileData.size)}
              </span>
            </div>
            {!fileData.binary ? (
              <SyntaxHighlighter
                language={map.languages(ext)[0]}
                style={atelierDuneLight}
                showLineNumbers
              >
                {fileData.content}
              </SyntaxHighlighter>
            ) : imgs.indexOf(ext) !== -1 ? (
              <div className="flex w-full justify-center p-4">
                <img src={apiUrl + `repos/${repo}/image/${file}`} alt="" />
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
