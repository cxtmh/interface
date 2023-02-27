import axios from "./axios";
import { IProduct } from "../types";

export const getPosition = async (address: string): Promise<Array<IProduct>> => {
  try {
    const { data } = await axios.get(`/users/positions/${address}`);
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getHistory = async (address: string, order: number) => {
  try {
    const { data } = await axios.get(`/users/history/${address}?sort=${order}`);
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getUserInfo = async (address: string) => {
  try {
    const { data } = await axios.get(`/users/${address}`);
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};
