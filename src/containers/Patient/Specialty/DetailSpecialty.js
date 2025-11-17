import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Card, Select, Row, Col, Spin, Typography, Empty, Divider } from "antd";
import {
  getAllDetailSpecialtyById,
  getAllProvince,
} from "../../../services/userService";
import { useDispatch, useSelector } from "react-redux";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import _ from "lodash";
import { LANGUAGES } from "../../../utils";
import "bootstrap/dist/css/bootstrap.min.css";
import { Buffer } from "buffer";

const { Option } = Select;
const { Title, Paragraph, Text } = Typography;

const DetailSpecialty = () => {
  const { id } = useParams();
  const history = useHistory();
  const language = useSelector((state) => state.app.language);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState({});
  const [hospitalList, setHospitalList] = useState([]);
  const [provinceList, setProvinceList] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("ALL");

  useEffect(() => {
    if (id) {
      fetchData("ALL");
      fetchProvince();
    }
  }, [id]);

  // Lấy chi tiết chuyên khoa
  const fetchData = async (location) => {
    setLoading(true);
    let res = await getAllDetailSpecialtyById({ id, location });
    if (res && res.errCode === 0) {
      setSpecialty(res.data);
      setHospitalList(res.data.hospitalSpecialties || []);
    }
    setLoading(false);
  };

  // Lấy danh sách tỉnh
  const fetchProvince = async () => {
    let resProvice = await getAllProvince();
    if (resProvice && resProvice.errCode === 0) {
      let data = resProvice.data || [];

      // Chuẩn hóa danh sách tỉnh
      let formatted = data.map((item) => ({
        keyMap: item.id,
        valueVi: item.name,
        valueEn: item.name,
      }));

      // Thêm lựa chọn "Tất cả"
      formatted.unshift({
        keyMap: "ALL",
        valueVi: "Toàn quốc",
        valueEn: "All provinces",
      });

      setProvinceList(formatted);
    }
  };

  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    fetchData(value);
  };

  return (
    <div className="detail-specialty-container bg-light">
      <HomeHeader />

      <div
        className="container"
        style={{
          paddingTop: "85px",
          paddingBottom: "85px",
          minHeight: "90vh",
        }}
      >
        {loading ? (
          <div className="text-center my-5">
            <Spin size="small" />
          </div>
        ) : (
          <>
            {/* Tiêu đề chuyên khoa */}
            <div className="text-center mb-4">
              {specialty.image && (
                <img
                  src={Buffer.from(specialty?.image, "base64").toString(
                    "binary"
                  )}
                  alt={specialty.name}
                  style={{
                    maxHeight: 220,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                />
              )}
              <Title level={2} className="text-primary">
                {specialty.name}
              </Title>
              {/* <div
                className="mt-3"
                dangerouslySetInnerHTML={{ __html: specialty.descriptionHTML }}
              /> */}
            </div>

            <Divider />

            {/* Bộ lọc tỉnh */}
            <div className="mb-4 text-center">
              <Select
                value={selectedProvince}
                style={{ width: 260 }}
                size="large"
                onChange={handleProvinceChange}
                allowClear
              >
                {provinceList.map((item) => (
                  <Option key={item.keyMap} value={item.keyMap}>
                    {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Danh sách bệnh viện */}
            <Row gutter={[24, 24]}>
              {hospitalList.length > 0 ? (
                hospitalList.map((item) => {
                  const hospital = item.hospital;
                  return (
                    <Col xs={24} sm={12} md={8} lg={6} key={hospital.id}>
                      <Card
                        hoverable
                        className="shadow-sm h-100"
                        onClick={() =>
                          history.push(`/detail-hospital/${hospital.id}`)
                        }
                        cover={
                          hospital.image ? (
                            <div
                              style={{
                                height: 180,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderBottom: "1px solid #ccc",
                              }}
                            >
                              <img
                                alt={hospital.name}
                                src={Buffer.from(
                                  hospital.image,
                                  "base64"
                                ).toString("binary")}
                                style={{
                                  height: 120,
                                  width: 120,
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                height: 180,
                                background: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <span className="text-muted">
                                Không có hình ảnh
                              </span>
                            </div>
                          )
                        }
                      >
                        <Title level={5}>{hospital.name}</Title>
                        <Paragraph ellipsis={{ rows: 2 }}>
                          {hospital.addressDetail},{" "}
                          {hospital?.provinceData?.name || ""}
                        </Paragraph>
                        <Paragraph className="mb-1">
                          <Text strong>
                            Giá khám:{" "}
                            {item.price
                              ? item.price.toLocaleString("vi-VN") + " VNĐ"
                              : "Liên hệ"}
                          </Text>
                        </Paragraph>
                        <Text type="secondary">
                          Tỉnh: {hospital?.provinceData?.name}
                        </Text>
                      </Card>
                    </Col>
                  );
                })
              ) : (
                <Col span={24}>
                  <Empty
                    description="Không có bệnh viện nào phù hợp"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </Col>
              )}
            </Row>
          </>
        )}
      </div>

      <HomeFooter />
    </div>
  );
};

export default DetailSpecialty;
