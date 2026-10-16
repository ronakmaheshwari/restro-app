import type { Role, Status } from "@/api/types";
import { create } from "zustand";

export interface GetMyDataResponse {
  id: string | null;
  name: string | null;
  email: string | null;
  role: Role | null;
  user_status: Status | null;
  created_at: Date | null;
}

type NameStore = GetMyDataResponse & {
  setData: (data: Partial<GetMyDataResponse>) => void;
};

const useNameStore = create<NameStore>((set) => ({
  id: null,
  name: null,
  email: null,
  role: null,
  user_status: null,
  created_at: null,

  setData: (data) => set(data),
}));


export default useNameStore