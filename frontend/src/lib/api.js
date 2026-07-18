import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const fetchProviders = async (category) => {
  const { data } = await axios.get(`${API}/providers/${category}`);
  return data;
};

export const fetchQuote = async (payload) => {
  const { data } = await axios.post(`${API}/quote`, payload);
  return data;
};
