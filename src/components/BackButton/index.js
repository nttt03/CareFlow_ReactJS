import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useHistory } from "react-router-dom";

const BackButton = ({ to = "/", label = "Quay lại", style, className }) => {
  const history = useHistory();

  return (
    <Button
      type="text"
      icon={<ArrowLeftOutlined />}
      onClick={() => history.push(to)}
      className={`d-flex align-items-center gap-1 ${className || ""}`}
      style={{ padding: 0, fontSize: 16, ...style }}
    >
      {label}
    </Button>
  );
};

export default BackButton;
