import React from "react";
import { UpOutlined } from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.scss";
import { Tooltip } from "antd";

const ScrollToTopButton = ({ onClick }) => {
  return (
    <Tooltip
      title="Lên đầu trang"
      placement="left"
      color="navy"
      styles={{
        body: {
          color: "white",
          fontWeight: "500",
          fontSize: "14px",
          borderRadius: "8px",
          padding: "8px 12px",
        },
      }}
    >
      <button
        onClick={onClick}
        className="
        btn btn-primary
        d-flex align-items-center justify-content-center
        shadow-lg
        scroll-top-btn pulse-float
      "
        style={{
          position: "fixed",
          width: "50px",
          height: "50px",
          bottom: "25px",
          right: "18px",
          borderRadius: "50%",
          fontSize: "20px",
          zIndex: 10,
        }}
      >
        <UpOutlined style={{ fontSize: "22px" }} />
      </button>
    </Tooltip>
  );
};

export default ScrollToTopButton;
