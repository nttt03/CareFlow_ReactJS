import React from "react";
import { Card, Row, Col } from "antd";
import {
  ClockCircleOutlined,
  BellOutlined,
  NotificationOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.scss";

export default function FeaturesSection() {
  const language = useSelector((state) => state.app.language);

  const features = [
    {
      icon: <ClockCircleOutlined style={{ fontSize: 38, color: "#0d6efd" }} />,
      vi: {
        title: "Đặt lịch nhanh chóng 24/7",
        desc: "Người dùng có thể đặt lịch bất cứ lúc nào, không cần gọi điện & chờ đợi.",
      },
      en: {
        title: "Fast appointment booking 24/7",
        desc: "Users can book appointments anytime, without calling or waiting.",
      },
    },
    {
      icon: <BellOutlined style={{ fontSize: 38, color: "#ffc107" }} />,
      vi: {
        title: "Nhắc lịch tự động qua Email",
        desc: "Giúp bệnh nhân không quên lịch khám.",
      },
      en: {
        title: "Automatic Email Reminders",
        desc: "Helps patients remember appointments and reduces last-minute cancellations.",
      },
    },
    {
      icon: <NotificationOutlined style={{ fontSize: 38, color: "#198754" }} />,
      vi: {
        title: "Theo dõi & nhận thông báo realtime",
        desc: "Thông báo khi lịch được xác nhận, thay đổi hoặc có cập nhật mới.",
      },
      en: {
        title: "Real-time Tracking & Notifications",
        desc: "Receive instant updates when an appointment is confirmed or changed.",
      },
    },
    // {
    //   icon: <SafetyOutlined style={{ fontSize: 38, color: "#d63384" }} />,
    //   vi: {
    //     title: "Hồ sơ sức khỏe bảo mật",
    //     desc: "Mọi thông tin được mã hóa và tuân thủ bảo mật y tế.",
    //   },
    //   en: {
    //     title: "Secure Medical Records",
    //     desc: "All data is encrypted and follows medical privacy standards.",
    //   },
    // },
  ];

  return (
    <div className="container my-5 fade-in-section">
      <div className="text-center mb-5">
        <h2 className="fw-bold" style={{ color: "#064580" }}>
          {language === "vi" ? "Tính năng nổi bật" : "Key Features"}
        </h2>
        <p style={{ color: "#6c757d" }}>
          {language === "vi"
            ? "Cải thiện trải nghiệm chăm sóc sức khỏe thông minh và tiện lợi"
            : "Enhancing healthcare experience with smart and convenient features"}
        </p>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {features.map((item, index) => {
          const content = language === "vi" ? item.vi : item.en;
          return (
            <Col xs={24} md={12} lg={6} key={index}>
              <Card
                hoverable
                className="feature-card fade-up"
                style={{
                  borderRadius: 12,
                  textAlign: "center",
                  padding: "25px",
                  height: "100%",
                }}
              >
                <div className="mb-3">{item.icon}</div>
                <h5 className="fw-bold" style={{ color: "#064580" }}>
                  {content.title}
                </h5>
                <p style={{ color: "#6c757d", fontSize: 15 }}>{content.desc}</p>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
