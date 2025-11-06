import React from "react";
import { Card, Row, Col } from "antd";
import {
  ClockCircleOutlined,
  BellOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.scss";

export default function FeaturesSection() {
  const features = [
    {
      icon: <ClockCircleOutlined style={{ fontSize: 38, color: "#0d6efd" }} />,
      title: "Đặt lịch nhanh chóng 24/7",
      desc: "Người dùng có thể đặt lịch bất cứ lúc nào, không cần gọi điện & chờ đợi.",
    },
    {
      icon: <BellOutlined style={{ fontSize: 38, color: "#ffc107" }} />,
      title: "Nhắc lịch tự động Email",
      desc: "Giúp bệnh nhân không quên lịch khám, giảm hủy lịch đột ngột.",
    },
    {
      icon: <NotificationOutlined style={{ fontSize: 38, color: "#198754" }} />,
      title: "Theo dõi và thông báo",
      desc: "Thông báo khi lịch được xác nhận, thay đổi hoặc có cập nhật từ bác sĩ.",
    },
  ];

  return (
    <div className="container my-5 fade-in-section">
      <div className="text-center mb-5">
        <h2 className="fw-bold" style={{ color: "#064580" }}>
          Tính năng nổi bật
        </h2>
        <p style={{ color: "#6c757d" }}>
          Cải thiện trải nghiệm chăm sóc sức khỏe thông minh và tiện lợi
        </p>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {features.map((item, index) => (
          <Col xs={24} md={8} key={index}>
            <Card
              hoverable
              className="feature-card"
              style={{
                borderRadius: 12,
                textAlign: "center",
                padding: "25px",
                minHeight: 220,
              }}
            >
              <div className="mb-3">{item.icon}</div>
              <h5 className="fw-bold" style={{ color: "#064580" }}>
                {item.title}
              </h5>
              <p style={{ color: "#6c757d", fontSize: 15 }}>{item.desc}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
