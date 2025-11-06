import React, { useState } from "react";
import { Card, Row, Col, Button } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HandBook.scss";

const mockBlogs = [
  {
    id: 1,
    title: "5 cách tăng cường hệ miễn dịch hiệu quả",
    desc: "Các thói quen giúp cơ thể khỏe mạnh...",
    detail:
      "Các thói quen như uống đủ nước, ngủ đủ giấc, tập thể dục thường xuyên và bổ sung vitamin C sẽ giúp tăng sức đề kháng tối ưu.",
    img: "https://raw.githubusercontent.com/nttt03/BookingCare_Sharing_host_files/main/HandBook/img1.png",
    category: "Chăm sóc sức khỏe",
  },
  {
    id: 2,
    title: "Dấu hiệu cảnh báo bệnh tim mạch",
    desc: "Nhận biết sớm triệu chứng...",
    detail:
      "Các dấu hiệu như đau ngực, khó thở, mệt mỏi kéo dài và đau lan lên tay trái có thể cảnh báo sớm bệnh tim mạch. Hãy khám bác sĩ ngay khi có triệu chứng.",
    img: "https://raw.githubusercontent.com/nttt03/BookingCare_Sharing_host_files/main/HandBook/img2.jpg",
    category: "Kiến thức y khoa",
  },
  {
    id: 3,
    title: "Mẹo phòng cảm cúm khi thời tiết thay đổi",
    desc: "Tips đơn giản giúp bạn khỏe mạnh...",
    detail:
      "Giữ ấm cơ thể, rửa tay thường xuyên, ăn nhiều rau xanh, trái cây và hạn chế chạm tay vào mắt – mũi – miệng sẽ giúp phòng cảm cúm hiệu quả.",
    img: "https://raw.githubusercontent.com/nttt03/BookingCare_Sharing_host_files/main/HandBook/img.jpeg",
    category: "Tips phòng bệnh",
  },
];

export default function HandBook() {
  return (
    <div className="container my-5 health-tips-container">
      <div className="text-center mb-4">
        <h2 className="fw-bold" style={{ color: "#064580" }}>
          Tin tức & Cẩm nang sức khỏe
        </h2>
        <p style={{ color: "#6c757d" }}>
          Cập nhật thông tin y tế – Bảo vệ sức khoẻ chủ động mỗi ngày
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {mockBlogs.map((item) => (
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

      {/* <div className="text-center mt-4">
        <Button
          type="primary"
          size="large"
          className="rounded-pill px-4"
          style={{ background: "#064580" }}
        >
          Xem thêm
        </Button>
      </div> */}
    </div>
  );
}
