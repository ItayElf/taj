import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../component/Footer";
import Header from "../component/Header";
import NotFound from "../component/NotFound";
import { apiUrl } from "../constants";
import { get } from "../utils/fetchUtils";

export default function Profile() {
  const [found, setFound] = useState<boolean | null>(null);
  const { username } = useParams();

  useEffect(() => {
    (async () => {
      const res = await get(apiUrl + "auth/user_exists", {
        username: username,
      });
      try {
        setFound(JSON.parse(await res.text()));
      } catch (e) {
        setFound(false);
      }
    })();
  }, [username]);

  if (found === null) {
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
  } else if (!found) {
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
      <Footer />
    </div>
  );
}
