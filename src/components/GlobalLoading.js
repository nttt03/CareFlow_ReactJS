import React from "react";
import { useSelector } from "react-redux";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lottie/LoadingLottie.json";

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
        background: "rgba(255,255,255,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div style={{ width: 120 }}>
        <Lottie animationData={loadingAnimation} loop />
      </div>
    </div>
  );
};

export default GlobalLoading;
