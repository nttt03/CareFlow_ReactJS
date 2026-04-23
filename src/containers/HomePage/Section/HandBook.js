import React, { useState } from "react";
import { Card, Row, Col } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HandBook.scss";
import { useSelector } from "react-redux";
import handbook1 from "../../../assets/handbook1.jpeg";
import handbook2 from "../../../assets/handbook2.png";
import handbook3 from "../../../assets/handbook3.png";

const blogsContent = {
  vi: {
    title: "Tin tức & Cẩm nang sức khỏe",
    subtitle: "Cập nhật thông tin y tế – Bảo vệ sức khoẻ chủ động mỗi ngày",
    blogs: [
      {
        id: 1,
        title: "5 cách tăng cường hệ miễn dịch hiệu quả",
        desc: "Các thói quen giúp cơ thể khỏe mạnh...",
        detail:
          "Các thói quen như uống đủ nước, ngủ đủ giấc, tập thể dục thường xuyên và bổ sung vitamin C sẽ giúp tăng sức đề kháng tối ưu.",
        img: handbook1,
        category: "Chăm sóc sức khỏe",
      },
      {
        id: 2,
        title: "Dấu hiệu cảnh báo bệnh tim mạch",
        desc: "Nhận biết sớm triệu chứng...",
        detail:
          "Đau ngực, khó thở, mệt mỏi kéo dài và đau lan lên tay trái có thể là dấu hiệu sớm bệnh tim. Hãy khám ngay khi có triệu chứng.",
        img: handbook2,
        category: "Kiến thức y khoa",
      },
      {
        id: 3,
        title: "Mẹo phòng cảm cúm khi thời tiết thay đổi",
        desc: "Tips đơn giản giúp bạn khỏe mạnh...",
        detail:
          "Giữ ấm cơ thể, rửa tay thường xuyên, ăn nhiều rau xanh – trái cây giúp bạn phòng cảm cúm hiệu quả.",
        img: handbook3,
        category: "Tips phòng bệnh",
      },
    ],
  },
  en: {
    title: "Health News & Guides",
    subtitle: "Stay informed — Take proactive control of your health",
    blogs: [
      {
        id: 1,
        title: "5 effective ways to boost your immune system",
        desc: "Healthy daily habits...",
        detail:
          "Drinking enough water, sleeping well, exercising regularly, and increasing vitamin C intake help strengthen immunity.",
        img: handbook1,
        category: "Healthcare Tips",
      },
      {
        id: 2,
        title: "Early warning signs of cardiovascular disease",
        desc: "Recognize symptoms early...",
        detail:
          "Chest pain, shortness of breath, fatigue, and pain radiating to the left arm may signal heart disease — seek medical care immediately.",
        img: handbook2,
        category: "Medical Knowledge",
      },
      {
        id: 3,
        title: "Tips to prevent flu during weather changes",
        desc: "Simple ways to stay healthy...",
        detail:
          "Keep warm, wash hands often, and eat more vegetables & fruits to effectively prevent flu.",
        img: handbook3,
        category: "Disease Prevention",
      },
    ],
  },
};

export default function HandBook() {
  const language = useSelector((state) => state.app.language);
  const content = blogsContent[language];

  return (
    <div className="container my-5 health-tips-container">
      <div className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: "#064580" }}>
          {content.title}
        </h2>
        <p style={{ color: "#6c757d" }}>{content.subtitle}</p>
      </div>

      <Row gutter={[24, 24]}>
        {content.blogs.map((item) => (
          <Col xs={24} md={8} key={item.id}>
            <Card hoverable className="health-card">
              <div className="image-wrapper">
                <img src={item.img} alt={item.title} className="blog-img" />
              </div>

              <span className="badge">{item.category}</span>
              <h5 className="fw-bold mt-2">{item.title}</h5>
              <p className="short-text">{item.desc}</p>
              <p className="detail-text">{item.detail}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
