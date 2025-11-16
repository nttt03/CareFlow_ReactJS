import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useHistory } from "react-router-dom";

const BackButton = ({ to, label = "Quay lại", style, className }) => {
  const history = useHistory();

  const handleClick = () => {
    if (typeof to === "function") {
      history.push(to());
    } else {
      history.push(to);
    }
  };

  return (
    <Button
      type="text"
      icon={<ArrowLeftOutlined />}
      onClick={handleClick}
      className={`d-flex align-items-center gap-1 ${className || ""}`}
      style={{ padding: 0, fontSize: 17, ...style }}
    >
      {label}
    </Button>
  );
};

export default BackButton;
