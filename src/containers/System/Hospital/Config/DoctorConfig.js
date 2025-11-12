import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  Row,
  Col,
  Card,
  Avatar,
  Divider,
  Select,
  Button,
  List,
  message,
} from "antd";
import {
  getAllLeaderHospitalConfig,
  getAllDoctorConfig,
  saveDoctorsForHospital,
  saveLeaderForHospital,
  getDoctorsByHospital,
} from "../../../../services/userService";
import {
  SafetyCertificateOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const DoctorConfig = ({
  hospitalId,
  hospitalName,
  hospitalAvatar,
  language,
  userInfo,
}) => {
  const [doctors, setDoctors] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [doctorsSelected, setDoctorsSelected] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [totalDoctor, setTotalDoctor] = useState([]);

  const [selectedLeader, setSelectedLeader] = useState(null);
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

  const fetchAllDoctorConfig = async () => {
    try {
      const res = await getAllDoctorConfig();
      if (res && res.data && res.errCode === 0) {
        setDoctors(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bác sĩ:", err);
    }
  };

  const fetchAllLeaderConfig = async () => {
    try {
      const res = await getAllLeaderHospitalConfig();
      if (res && res.data && res.errCode === 0) {
        setLeaders(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách lãnh đạo:", err);
    }
  };

  const fetchHospitalDoctors = async () => {
    if (!hospitalId) return;
    try {
      const res = await getDoctorsByHospital(hospitalId);
      if (res && res.data && res.errCode === 0) {
        const doctorsR2 = res.data.filter((d) => d.roleId === "R2");
        const selected = doctorsR2.map((s) => ({
          value: s.id,
          label: s.fullName,
        }));
        setDoctorsSelected(res.data); // giữ nguyên để có leader
        setSelectedDoctors(selected);
        setTotalDoctor(doctorsR2.length); // chỉ đếm R2
      }
    } catch (err) {
      console.error("Lỗi khi lấy bác sĩ của bệnh viện:", err);
    }
  };

  useEffect(() => {
    fetchAllDoctorConfig();
    fetchHospitalDoctors();
    fetchAllLeaderConfig();
  }, [hospitalId]);

  const handleSave = async () => {
    if (!hospitalId)
      return message.error(
        language === "vi" ? "Hospital ID không hợp lệ!" : "Hospital ID invalid!"
      );

    try {
      const res = await saveDoctorsForHospital({
        hospitalId,
        doctorIds: selectedDoctors.map((d) => d.value),
      });

      if (res && res.errCode === 0) {
        fetchHospitalDoctors();
        fetchAllDoctorConfig();
        message.success(
          language === "vi"
            ? "Cập nhật bác sĩ thành công!"
            : "Update doctor success!"
        );
      } else {
        message.error(
          res.message ||
            (language === "vi" ? "Lỗi khi lưu bác sĩ!" : "Error saving doctor!")
        );
      }
    } catch (err) {
      console.error(err);
      message.error(
        language === "vi"
          ? "Có lỗi xảy ra khi lưu bác sĩ!"
          : "Error saving doctor!"
      );
    }
  };

  const handleSaveLeader = async () => {
    const messages = {
      selectLeader:
        language === "vi"
          ? "Vui lòng chọn lãnh đạo!"
          : "Please select a leader!",
      success:
        language === "vi"
          ? "Cập nhật lãnh đạo thành công!"
          : "Leader updated successfully!",
      error: language === "vi" ? "Có lỗi xảy ra!" : "An error occurred!",
      systemError: language === "vi" ? "Lỗi hệ thống!" : "System error!",
    };

    if (!hospitalId || !selectedLeader) {
      return message.error(messages.selectLeader);
    }

    try {
      const res = await saveLeaderForHospital({
        hospitalId,
        leaderId: selectedLeader,
      });

      if (res.errCode === 0) {
        message.success(messages.success);
        setShowLeaderDropdown(false);
        fetchHospitalDoctors();
        fetchAllLeaderConfig();
        setSelectedLeader(null);
      } else {
        message.error(res.message || messages.error);
      }
    } catch (error) {
      console.error("Error saving leader:", error);
      message.error(messages.systemError);
    }
  };

  return (
    <Row gutter={24}>
      {/* Cột trái */}
      <Col span={12}>
        <Card className="border border-1 border-secondary">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3">
              <Avatar
                src={hospitalAvatar}
                size={64}
                className="border border-1 border-secondary"
              />
              <span className="fs-5 fw-bold">{hospitalName}</span>
            </div>

            <span
              style={{ backgroundColor: "#08bb25" }}
              className=" text-white px-3 py-1 rounded-pill"
            >
              {totalDoctor} {language === "vi" ? "bác sĩ" : "doctor"}
            </span>
          </div>

          <Divider
            className="text-secondary"
            style={{
              borderTop: "1px solid currentColor",
              margin: 0,
            }}
          />

          {/* LEADER CARD */}
          {userInfo?.roleId === "R1" &&
            (() => {
              const leader = doctorsSelected.find((doc) => doc.roleId === "R4");

              return (
                <div
                  className="my-2 p-3 rounded-3 text-white position-relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #FFA500, #FFD700)",
                    boxShadow: "0 4px 12px rgba(255, 215, 0, 0.4)",
                  }}
                >
                  <div className="d-flex align-items-center gap-3 position-relative z-10">
                    <div className="position-relative">
                      <Avatar
                        src={leader?.avatar || "/defaultimg.png"}
                        size={60}
                        className="border border-4 border-white shadow-lg"
                      />
                    </div>

                    <div>
                      <h5 className="mb-1 fw-bold">
                        {leader ? leader.fullName : "Chưa có lãnh đạo"}
                      </h5>
                      <span
                        className="badge bg-white text-dark px-2 py-1 rounded-pill fw-bold"
                        style={{ fontSize: "11px" }}
                      >
                        {language === "vi"
                          ? "LÃNH ĐẠO BỆNH VIỆN"
                          : "HOSPITAL LEADER"}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      cursor: "pointer",
                    }}
                  >
                    {leader ? (
                      <SwapOutlined
                        style={{ fontSize: 22, color: "white" }}
                        onClick={() =>
                          setShowLeaderDropdown(!showLeaderDropdown)
                        }
                        title="Đổi lãnh đạo"
                      />
                    ) : (
                      <PlusOutlined
                        style={{ fontSize: 22, color: "white" }}
                        onClick={() =>
                          setShowLeaderDropdown(!showLeaderDropdown)
                        }
                        title="Thêm lãnh đạo"
                      />
                    )}
                  </div>

                  {showLeaderDropdown && (
                    <div style={{ marginTop: 10 }}>
                      <Select
                        showSearch
                        style={{ width: "100%" }}
                        placeholder={
                          language === "vi" ? "Chọn lãnh đạo" : "Select leader"
                        }
                        value={selectedLeader}
                        onChange={(value) => setSelectedLeader(value)}
                        onBlur={() => setShowLeaderDropdown(false)}
                        optionFilterProp="children"
                      >
                        {leaders.map((ld) => (
                          <Option key={ld.id} value={ld.id}>
                            {ld.fullName}
                          </Option>
                        ))}
                      </Select>

                      <Button
                        type="primary"
                        block
                        style={{ marginTop: 8 }}
                        onClick={handleSaveLeader}
                      >
                        {language === "vi" ? "Lưu" : "Save"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}

          <List
            header={
              <b>{language === "vi" ? "Danh sách bác sĩ" : "List doctor"}</b>
            }
            dataSource={doctorsSelected.filter(
              (s) =>
                s.roleId === "R2" &&
                selectedDoctors.some((d) => d.value === s.id)
            )}
            grid={{ gutter: 16, column: 3 }}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  className="text-center"
                  bodyStyle={{ padding: 8 }}
                >
                  <Avatar
                    src={item.avatar || "/defaultimg.png"}
                    size={48}
                    className="mb-2"
                  />
                  <div>{item.fullName}</div>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </Col>

      {/* Cột phải */}
      <Col span={12}>
        <h5>{language === "vi" ? "Chọn bác sĩ" : "Select doctor"}</h5>
        <p className="text-danger">
          {language === "vi" ? "Lưu ý nhấn" : "Note the press"}{" "}
          <strong>{language === "vi" ? "Lưu" : "Save"}</strong>{" "}
          {language === "vi"
            ? "để lưu bác sĩ vào danh sách!"
            : "to save the doctor to your list!"}
        </p>
        <Select
          showSearch
          mode="multiple"
          labelInValue
          style={{ width: "100%", marginBottom: 16 }}
          placeholder={language === "vi" ? "Chọn bác sĩ" : "Select doctor"}
          value={selectedDoctors} // [{ value: id, label: fullName }]
          onChange={(values) => setSelectedDoctors(values)}
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        >
          {doctors.map((item) => (
            <Option key={item.id} value={item.id} label={item.fullName}>
              {item.fullName}
            </Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleSave}>
          {language === "vi" ? "Lưu" : "Save"}
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    userInfo: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DoctorConfig);
