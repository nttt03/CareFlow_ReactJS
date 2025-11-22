import React from "react";
import { Row, Col, Card, Skeleton, Select } from "antd";

const { Option } = Select;

const DetailSpecialtySkeleton = ({ hospitalCount = 8 }) => {
  return (
    <div className="text-center">
      <div className="d-flex flex-column">
        <Skeleton.Avatar
          active
          size={200}
          shape="square"
          style={{ marginBottom: 16, borderRadius: 12 }}
        />
        <Skeleton.Input
          active
          size="large"
          style={{ width: 300, margin: "0 auto 24px" }}
        />

        <Skeleton.Input
          active
          size="middle"
          style={{ width: 260, marginBottom: 40 }}
        />
      </div>

      <Row gutter={[24, 24]}>
        {Array.from({ length: hospitalCount }).map((_, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card hoverable className="shadow-sm h-100">
              <Skeleton.Avatar
                active
                size={120}
                shape="square"
                style={{
                  margin: "0 auto 16px",
                  display: "block",
                  height: 120,
                  width: 120,
                  background: "#f0f0f0",
                }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: "80%", margin: "0 auto 8px" }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: "90%", margin: "0 auto 6px" }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: "60%", margin: "0 auto 6px" }}
              />
              <Skeleton.Input
                active
                size="small"
                style={{ width: "50%", margin: "0 auto" }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DetailSpecialtySkeleton;
