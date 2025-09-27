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
  getAllDoctorConfig,
  saveDoctorsForHospital,
  getDoctorsByHospital,
} from "../../../../services/userService";
import * as actions from "../../../../store/actions";
import { Buffer } from "buffer";

const { Option } = Select;

const DoctorConfig = ({
  hospitalId,
  hospitalName,
  hospitalAvatar,
  language,
}) => {
  const [doctors, setDoctors] = useState([]);
  const [doctorsSelected, setDoctorsSelected] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [totalDoctor, setTotalDoctor] = useState([]);

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

  const fetchHospitalDoctors = async () => {
    if (!hospitalId) return;
    try {
      const res = await getDoctorsByHospital(hospitalId);
      if (res && res.data && res.errCode === 0) {
        const selected = res.data.map((s) => ({
          value: s.id,
          label: s.fullName,
        }));
        setDoctorsSelected(res.data);
        setSelectedDoctors(selected);
        setTotalDoctor(res.data.length);
      }
    } catch (err) {
      console.error("Lỗi khi lấy bác sĩ của bệnh viện:", err);
    }
  };

  useEffect(() => {
    fetchAllDoctorConfig();
    fetchHospitalDoctors();
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
          res.message || language === "vi"
            ? "Lỗi khi lưu bác sĩ!"
            : "Error saving doctor!"
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
                className="border border-1 border-black"
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

          <List
            header={
              <b>{language === "vi" ? "Danh sách bác sĩ" : "List doctor"}</b>
            }
            dataSource={doctorsSelected.filter((s) =>
              selectedDoctors.some((d) => d.value === s.id)
            )}
            grid={{ gutter: 16, column: 3 }}
            renderItem={(item) => {
              console.log("itemDoctor: ", item);
              return (
                <List.Item>
                  <Card
                    hoverable
                    className="text-center"
                    bodyStyle={{ padding: "8px" }}
                  >
                    <Avatar
                      src={item.avatar || "/defaultimg.png"}
                      size={48}
                      className="mb-2"
                    />
                    <div>{item.fullName}</div>
                  </Card>
                </List.Item>
              );
            }}
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
          Lưu
        </Button>
      </Col>
    </Row>
  );
};

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(DoctorConfig);
