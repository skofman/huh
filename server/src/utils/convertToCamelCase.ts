import { camelCase } from "change-case";
import { User } from "../pgql";

const convertToCamelCase = (obj: User) => {
  const result = {};

  for (const key in obj) {
    // @ts-ignore
    result[camelCase(key)] = obj[key];
  }

  return result;
};

export default convertToCamelCase;
