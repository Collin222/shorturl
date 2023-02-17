import { ID_CHARS, ID_LENGTH } from "../constants";

export const createId = () => {
  let id = "";
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
  }
  return id;
};
