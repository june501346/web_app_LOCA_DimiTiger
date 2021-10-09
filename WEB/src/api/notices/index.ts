import { useQuery } from "react-query";

import Notice from "../../types/Notice";
import client from "../client";

export async function getNotices(): Promise<Notice[]> {
  const { data } = await client.get("/notices");
  return data;
}

export async function addNotices(body: object): Promise<Notice[]> {
  const { data } = await client.post("/notices", body);
  return data;
}

export function useNotices() {
  const { data, isLoading } = useQuery(["notices"], () => getNotices());

  return {
    notices: data,
    isLoading,
  };
}