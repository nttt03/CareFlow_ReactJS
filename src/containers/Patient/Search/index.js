import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import { getAllProvince, searchAll } from "../../../services/userService";
import { useSelector } from "react-redux";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import { LANGUAGES } from "../../../utils";
import { Buffer } from "buffer";
import {
  Input,
  Select,
  Button,
  Row,
  Col,
  Spin,
  Typography,
  Empty,
  Rate,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import "./index.scss";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const Search = () => {
  const { id } = useParams();
  const history = useHistory();
  const language = useSelector((state) => state.app.language);
  const TopDoctors = useSelector((state) => state.admin.topDoctors);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [provinceList, setProvinceList] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [doctorList, setDoctorList] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keywordQuery = params.get("keyword") || "";

    setSearchKeyword(keywordQuery);
    if (keywordQuery) {
      handleSearch(keywordQuery);
    }
  }, [location.search]);

  useEffect(() => {
    fetchProvince();
    // Chỉ tìm kiếm mặc định nếu KHÔNG có keyword trong URL
    if (!location.search.includes("keyword")) {
      handleSearch(""); // Tìm toàn bộ
    }
  }, []);

  const fetchProvince = async () => {
    let resProvice = await getAllProvince();
    if (resProvice && resProvice.errCode === 0) {
      let data = resProvice.data || [];
      let formatted = data.map((item) => ({
        keyMap: item.id,
        valueVi: item.name,
        valueEn: item.name,
      }));
      formatted.unshift({
        keyMap: "ALL",
        valueVi: "Toàn quốc",
        valueEn: "All provinces",
      });
      setProvinceList(formatted);
    }
  };

  const handleSearch = async (keyword = "") => {
    setLoading(true);

    const res = await searchAll({
      keyword: keyword.trim(),
      provinceId: selectedProvince === "ALL" ? "" : selectedProvince,
    });

    if (res && res.data && res.errCode === 0) {
      setDoctorList(res.data?.doctors || []);
      setHospitalList(res.data?.hospitals || []);
    }

    setLoading(false);
  };

  return (
    <>
      <HomeHeader />

      <div className="search-bar-container bg-white">
        <div className="container">
          <Row gutter={[16, 16]} align="middle" justify="center">
            <Col xs={24} md={10}>
              <Input
                size="large"
                placeholder={
                  language === "vi"
                    ? "Tìm theo bác sĩ, bệnh viện..."
                    : "Search by doctor, hospital..."
                }
                prefix={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={() => handleSearch(searchKeyword)}
                allowClear
              />
            </Col>

            <Col xs={12} md={6}>
              <Select
                size="large"
                value={selectedProvince}
                onChange={(value) => setSelectedProvince(value)}
                style={{ width: "100%" }}
                suffixIcon={<EnvironmentOutlined />}
              >
                {provinceList.map((item) => (
                  <Option key={item.keyMap} value={item.keyMap}>
                    {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={12} md={4}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                size="large"
                block
                onClick={() => handleSearch(searchKeyword)}
              >
                {language === "vi" ? "Tìm kiếm" : "Search"}
              </Button>
            </Col>
          </Row>
        </div>
      </div>

      {/* Danh sách kết quả */}
      <div className="result-container py-5">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={17}>
            <Title level={5} style={{ fontSize: "20px", lineHeight: 1.2 }}>
              {language === "vi" ? "Tìm thấy" : "Find"}{" "}
              <Text strong className="text-danger" style={{ fontSize: "20px" }}>
                {(doctorList?.length || 0) + (hospitalList?.length || 0)}
              </Text>{" "}
              {language === "vi" ? "kết quả." : "result"}
            </Title>
            {loading ? (
              <div className="text-center py-5">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {/* Danh sách bác sĩ */}
                {doctorList && doctorList.length > 0 && (
                  <>
                    <Title level={4} className="fw-bold text-primary mt-4">
                      {language === "vi" ? "Bác sĩ" : "Doctors"}
                    </Title>
                    <div className="doctor-list mb-5">
                      {doctorList.map((doctor, index) => {
                        let imageBase64 = "";
                        if (doctor.avatar) {
                          imageBase64 = new Buffer(
                            doctor.avatar,
                            "base64"
                          ).toString("binary");
                        }
                        return (
                          <div
                            className="card doctor-card mb-4 p-3 shadow-sm border-0"
                            key={index}
                          >
                            <Row
                              align="middle"
                              gutter={[16, 16]}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Col xs={24} md={18}>
                                <Row align="middle" gutter={[16, 16]}>
                                  <Col xs={4} md={5} className="text-center">
                                    <img
                                      src={imageBase64 || "/defaultImg.png"}
                                      alt={doctor.fullName}
                                      className="rounded-circle doctor-avatar"
                                    />
                                  </Col>
                                  <Col xs={20} md={19}>
                                    <h5 className="fw-bold mb-1">
                                      {doctor.fullName}
                                    </h5>
                                    <div className="mb-2 text-secondary">
                                      {doctor.doctorInfor?.specialty && (
                                        <span className="badge bg-success text-white rounded-pill p-2">
                                          {doctor.doctorInfor.specialty.name}
                                        </span>
                                      )}
                                    </div>
                                    {doctor?.doctorInfor?.hospital
                                      ?.addressDetail && (
                                      <p className="text-muted mb-0 text-truncate">
                                        {doctor?.doctorInfor?.hospital
                                          ?.addressDetail || "-"}
                                        {doctor?.doctorInfor?.hospital
                                          ?.provinceData?.name
                                          ? `, ${doctor?.doctorInfor?.hospital?.provinceData.name}`
                                          : ""}
                                      </p>
                                    )}
                                  </Col>
                                </Row>
                              </Col>

                              <Col
                                xs={24}
                                md={6}
                                className="text-md-end text-center"
                              >
                                <Button
                                  type="primary"
                                  size="middle"
                                  onClick={() =>
                                    history.push(`/detail-doctor/${doctor.id}`)
                                  }
                                >
                                  {language === "vi" ? "Đặt khám" : "Booking"}
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Danh sách bệnh viện */}
                {hospitalList && hospitalList.length > 0 && (
                  <>
                    <Title level={4} className="fw-bold text-success mt-5">
                      {language === "vi" ? "Bệnh viện" : "Hospitals"}
                    </Title>
                    <div className="hospital-list">
                      {hospitalList.map((hospital, index) => {
                        let imageBase64 = "";
                        if (hospital.image) {
                          imageBase64 = new Buffer(
                            hospital.image,
                            "base64"
                          ).toString("binary");
                        }
                        return (
                          <div
                            className="card hospital-card mb-4 p-3 shadow-sm border-0"
                            key={index}
                          >
                            <Row
                              align="middle"
                              gutter={[16, 16]}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Col xs={24} md={18}>
                                <Row align="middle" gutter={[16, 16]}>
                                  <Col xs={4} md={5} className="text-center">
                                    <img
                                      src={imageBase64 || "/defaultImg.png"}
                                      alt={hospital.name}
                                      className="rounded hospital-avatar"
                                    />
                                  </Col>
                                  <Col xs={20} md={19}>
                                    <h5 className="fw-bold mb-1">
                                      {hospital.name}
                                    </h5>
                                    <p className="text-muted mb-0">
                                      {hospital?.addressDetail || "-"}
                                      {hospital?.provinceData?.name
                                        ? `, ${hospital?.provinceData.name}`
                                        : ""}
                                    </p>
                                  </Col>
                                </Row>
                              </Col>

                              <Col
                                xs={24}
                                md={6}
                                className="text-md-end text-center"
                              >
                                <Button
                                  type="default"
                                  size="middle"
                                  onClick={() =>
                                    history.push(
                                      `/detail-hospital/${hospital.id}`
                                    )
                                  }
                                >
                                  {language === "vi"
                                    ? "Xem chi tiết"
                                    : "See details"}
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {doctorList.length === 0 && hospitalList.length === 0 && (
                  <div className="py-5">
                    <Empty
                      description={
                        <span>
                          {language === "vi"
                            ? "Không tìm thấy kết quả phù hợp."
                            : "No matching results found."}
                        </span>
                      }
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </div>
                )}
              </>
            )}
          </Col>
          {/* Cột phải - Top Doctors */}
          <Col xs={24} md={7}>
            <div className="topDoctor-container rounded">
              <Title
                level={4}
                className="section-topDoctor px-3 py-3 fw-bold animate__animated animate__pulse animate__infinite"
              >
                {/* <TrophyOutlined style={{ fontSize: 24, color: "#faad14" }} />{" "} */}
                {language === "vi"
                  ? "Top bác sĩ nổi bật"
                  : "Top outstanding doctors"}
              </Title>

              {TopDoctors?.slice(0, 3).map((doc, idx) => {
                let avatar = "";
                if (doc.avatar) {
                  avatar = new Buffer(doc.avatar, "base64").toString("binary");
                }

                return (
                  <div
                    key={idx}
                    className="d-flex align-items-center mb-3 border-bottom pb-2 p-3"
                  >
                    <img
                      src={avatar || "/defaultImg.png"}
                      className="rounded-circle"
                      alt={doc.fullName}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />

                    <div className="ms-3">
                      <strong>{doc.fullName}</strong>
                      <div className="text-secondary">
                        {doc.doctorInfor?.specialty?.name}
                      </div>

                      {doc?.doctorInfor?.rating && (
                        <Rate
                          disabled
                          allowHalf
                          value={Number(doc?.doctorInfor?.rating) || 0}
                          style={{
                            color: "#FFD700",
                            fontSize: "15px",
                            width: "100%",
                          }}
                        />
                      )}

                      <Button
                        size="small"
                        type="primary"
                        className="mt-2"
                        onClick={() => history.push(`/detail-doctor/${doc.id}`)}
                      >
                        {language === "vi" ? "Đặt khám" : "Booking"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>
        </Row>
      </div>

      <HomeFooter />
    </>
  );
};

export default Search;
