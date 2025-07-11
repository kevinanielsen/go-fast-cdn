import { atom } from "jotai";
import { TFile } from "./types/file";

export const sizeAtom = atom(0);
export const sizeLoadingAtom = atom(false);
export const filesAtom = atom<TFile[]>([]);
