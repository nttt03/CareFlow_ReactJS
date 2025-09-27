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
  getAllSpecialty,
  saveSpecialtiesForHospital,
  getSpecialtiesByHospital,
} from "../../../../services/userService";

const { Option } = Select;

const HospitalSpecialtyConfig = ({
  hospitalId,
  hospitalName,
  hospitalAvatar,
  language,
}) => {
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [totalSpecialty, setTotalSpecialty] = useState(0);

  const fetchAllSpecialty = async () => {
    try {
      const res = await getAllSpecialty();
      if (res && res.data && res.errCode === 0) {
        setSpecialties(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách chuyên khoa:", err);
    }
  };

  const fetchHospitalSpecialties = async () => {
    if (!hospitalId) return;
    try {
      const res = await getSpecialtiesByHospital(hospitalId);
      if (res && res.data && res.errCode === 0) {
        const ids = res.data.map((s) => s.id);
        setSelectedSpecialties(ids);
        setTotalSpecialty(res.data.length);
      }
    } catch (err) {
      console.error("Lỗi khi lấy chuyên khoa của bệnh viện:", err);
    }
  };

  useEffect(() => {
    fetchAllSpecialty();
    fetchHospitalSpecialties();
  }, [hospitalId]);

  const handleSave = async () => {
    if (!hospitalId)
      return message.error(
        language === "vi" ? "Hospital ID không hợp lệ!" : "Hospital ID invalid!"
      );

    try {
      const res = await saveSpecialtiesForHospital({
        hospitalId,
        specialtyIds: selectedSpecialties,
      });

      if (res && res.errCode === 0) {
        message.success(
          language === "vi"
            ? "Cập nhật chuyên khoa thành công!"
            : "Update specialty success!"
        );
      } else {
        message.error(
          res.message || language === "vi"
            ? "Lỗi khi lưu chuyên khoa!"
            : "Error saving specialty!"
        );
      }
    } catch (err) {
      console.error(err);
      message.error(
        language === "vi"
          ? "Có lỗi xảy ra khi lưu chuyên khoa!"
          : "Error saving specialty!"
      );
    }
  };

  console.log("selectedSpecialties: ", selectedSpecialties);

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
              className="text-white px-3 py-1 rounded-pill"
            >
              {totalSpecialty} {language === "vi" ? "chuyên khoa" : "specialty"}
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
              <b>
                {language === "vi" ? "Danh sách chuyên khoa" : "List specialty"}
              </b>
            }
            dataSource={specialties.filter((s) =>
              selectedSpecialties.includes(s.id)
            )}
            grid={{ gutter: 16, column: 3 }}
            renderItem={(item) => {
              console.log("item: ", item);
              return (
                <List.Item>
                  <Card
                    hoverable
                    className="text-center"
                    bodyStyle={{ padding: "8px" }}
                  >
                    <Avatar src={item.image} size={48} className="mb-2" />
                    <div>{item.name}</div>
                  </Card>
                </List.Item>
              );
            }}
          />
        </Card>
      </Col>

      {/* Cột phải */}
      <Col span={12}>
        <h5>{language === "vi" ? "Chọn chuyên khoa" : "Select specialty"}</h5>
        <p className="text-danger">
          {language === "vi" ? "Lưu ý nhấn" : "Note the press"}{" "}
          <strong>{language === "vi" ? "Lưu" : "Save"}</strong>{" "}
          {language === "vi"
            ? "để lưu chuyên khoa vào danh sách!"
            : "to save the specialty to your list!"}
        </p>
        <Select
          showSearch
          mode="multiple"
          style={{ width: "100%", marginBottom: 16 }}
          placeholder={
            language === "vi" ? "Chọn chuyên khoa" : "Select sepcialty"
          }
          value={selectedSpecialties}
          onChange={setSelectedSpecialties}
          optionLabelProp="label"
          filterOption={(input, option) =>
            option.label.toLowerCase().includes(input.toLowerCase())
          }
        >
          {specialties.map((s) => (
            <Option key={s.id} value={s.id} label={s.name}>
              {s.name}
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

export default connect(mapStateToProps)(HospitalSpecialtyConfig);
