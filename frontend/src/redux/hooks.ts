import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function getInitial<T>(key: string) {
  const saved = localStorage.getItem(key);
  if (!saved) {
    return null;
  }
  return JSON.parse(saved) as T;
}
