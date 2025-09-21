import React, { useEffect, useState } from "react";
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
}) => {
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

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
    if (!hospitalId) return message.error("Hospital ID không hợp lệ");

    try {
      const res = await saveSpecialtiesForHospital({
        hospitalId,
        specialtyIds: selectedSpecialties,
      });

      if (res && res.errCode === 0) {
        message.success("Cập nhật chuyên khoa thành công!");
      } else {
        message.error(res.message || "Lỗi khi lưu chuyên khoa");
      }
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra khi lưu chuyên khoa");
    }
  };

  return (
    <Row gutter={24}>
      {/* Cột trái */}
      <Col span={12}>
        <Card className="border border-1 border-secondary">
          <div className="d-flex align-items-center justify-content-start gap-3 mb-3">
            <Avatar
              src={hospitalAvatar}
              size={64}
              className="border border-1 border-black"
            />
            <span className="fs-5 fw-bold">{hospitalName}</span>
          </div>

          <Divider
            className="text-secondary"
            style={{
              borderTop: "1px solid currentColor",
              margin: 0,
            }}
          />

          <List
            header={<b>Danh sách chuyên khoa</b>}
            dataSource={specialties.filter((s) =>
              selectedSpecialties.includes(s.id)
            )}
            grid={{ gutter: 16, column: 3 }}
            renderItem={(item) => (
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
            )}
          />
        </Card>
      </Col>

      {/* Cột phải */}
      <Col span={12}>
        <h5>Chọn chuyên khoa</h5>
        <p className="text-danger">
          Lưu ý nhấn <strong>Lưu</strong> để lưu chuyên khoa vào danh sách!
        </p>
        <Select
          showSearch
          mode="multiple"
          style={{ width: "100%", marginBottom: 16 }}
          placeholder="Chọn chuyên khoa"
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

export default HospitalSpecialtyConfig;
