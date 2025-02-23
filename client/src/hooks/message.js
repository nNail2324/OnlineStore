import { message } from "antd";

export const useMessage = () => {
  return (text) => {
    if (text) {
      message.info(text);
    }
  };
};
