import React from "react";
import { useSelector } from "react-redux";
import { Spin } from "antd";

const GlobalLoading = () => {
  const isLoading = useSelector((state) => state.app.isLoading);

  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(255,255,255,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <Spin size="large" tip="Đang xử lý..." />
    </div>
  );
};

export default GlobalLoading;
