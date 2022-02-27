import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiUrl } from "../constants";
import { useAppSelector } from "../redux/hooks";
import { post } from "./fetchUtils";

export function timeSince(timestamp: number) {
  const seconds = new Date().getTime() * 0.001 - timestamp;

  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

export function getBytesSize(size: number) {
  let interval = size / 1e9;
  if (interval >= 1) {
    return Math.round(interval * 100) / 100 + " GB";
  }
  interval = size / 1e6;
  if (interval >= 1) {
    return Math.round(interval * 100) / 100 + " MB";
  }
  interval = size / 1000;
  if (interval >= 1) {
    return Math.round(interval * 100) / 100 + " KB";
  }
  return size + " bytes";
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

export function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useSame(username: string) {
  const [same, setSame] = useState(false);
  const { username: loggedUser, token } = useAppSelector(
    (state) => state.userData
  );
  useEffect(() => {
    async function checkSame() {
      if (loggedUser === username) {
        const res = await post(apiUrl + "auth/validate_token", {
          username,
          token,
        });
        const text = await res.text();
        if (res.ok) {
          setSame(JSON.parse(text));
        }
      }
    }
    checkSame();
  }, [loggedUser, token, username]);
  return { same };
}
