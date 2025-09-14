import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import markdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import { CommonUtils } from "../../../utils";
import {
  getAllProvince,
  getHospitalById,
  updateHospital,
} from "../../../services/userService";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { FormattedMessage } from "react-intl";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Row,
  Col,
  Image,
  Popconfirm,
  Tabs,
  Table,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TabPane } = Tabs;
const mdParser = new markdownIt();

function EditHospital({ language }) {
  const history = useHistory();
  const { hospitalId } = useParams();
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [imageBase64, setImageBase64] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");

  const [specialties, setSpecialties] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const handleCancel = () => {
    history.push("/system/manage-hospital");
  };

  const fetchProvinces = async () => {
    try {
      const res = await getAllProvince();
      if (res && res.data) {
        setProvinces(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi fetch provinces:", err);
    }
  };

  const fetchHospitalDetail = async () => {
    if (!hospitalId) return;
    try {
      const res = await getHospitalById(hospitalId);
      if (res && res.data) {
        const hospital = res.data;
        form.setFieldsValue({
          name: hospital.name,
          provinceId: hospital.provinceId,
          addressDetail: hospital.addressDetail,
        });
        setDescriptionMarkdown(hospital.descriptionMarkdown || "");
        setDescriptionHTML(hospital.descriptionHTML || "");
        setImageBase64(hospital.image || "");
        setSpecialties(hospital.specialties || []);
        setLeaders(hospital.leaders || []);
        setDoctors(hospital.doctors || []);
      }
    } catch (err) {
      console.error("Lỗi khi fetch hospital detail:", err);
    }
  };

  useEffect(() => {
    fetchProvinces();
    fetchHospitalDetail();
  }, [hospitalId]);

  const handleEditorChange = ({ html, text }) => {
    setDescriptionMarkdown(text);
    setDescriptionHTML(html);
  };

  const handleOnChangeImage = async (info) => {
    const latestFile = info.fileList[info.fileList.length - 1];
    if (latestFile?.originFileObj) {
      const base64 = await CommonUtils.getBase64(latestFile.originFileObj);
      setImageBase64(base64);
    } else {
      setImageBase64("");
    }
  };

  const handleSaveHospital = async (values) => {
    const hospitalData = {
      id: hospitalId,
      ...values,
      imageBase64,
      descriptionHTML,
      descriptionMarkdown,
    };

    let res = await updateHospital(hospitalData);
    if (res && res.errCode === 0) {
      toast.success("Cập nhật bệnh viện thành công!");
      history.push("/system/manage-hospital");
    } else {
      toast.error("Lỗi khi cập nhật bệnh viện!");
      console.log("check res-err: ", res);
    }
  };

  return (
    <div className="container mt-3 manage-hospital-container">
      <div className="title py-2">
        <FormattedMessage id="admin.manage-hospital.title-edit" />
      </div>

      <Tabs defaultActiveKey="1">
        {/* Tab 1 - Thông tin bệnh viện */}
        <TabPane tab="Thông tin bệnh viện" key="1">
          <Form form={form} layout="vertical" onFinish={handleSaveHospital}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label={
                    <FormattedMessage id="admin.manage-hospital.name-hospital" />
                  }
                  rules={[{ required: true, message: "Nhập tên bệnh viện" }]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label={
                    <FormattedMessage id="admin.manage-hospital.img-hospital" />
                  }
                  name="image"
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    {imageBase64 && (
                      <Image
                        src={imageBase64}
                        alt="Preview"
                        width={50}
                        style={{ borderRadius: 8 }}
                      />
                    )}
                    <Upload
                      beforeUpload={() => false}
                      maxCount={1}
                      onChange={handleOnChangeImage}
                      accept="image/*"
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />}>
                        <FormattedMessage id="admin.manage-hospital.upload" />
                      </Button>
                    </Upload>
                  </div>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="provinceId"
                  label={
                    <FormattedMessage id="admin.manage-hospital.province" />
                  }
                  rules={[{ required: true, message: "Chọn tỉnh/thành phố" }]}
                >
                  <Select
                    placeholder="------"
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    optionFilterProp="children"
                  >
                    {provinces.map((prov) => (
                      <Option key={prov.id} value={prov.id}>
                        {prov.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="addressDetail"
                  label={
                    <FormattedMessage id="admin.manage-hospital.address" />
                  }
                  rules={[{ required: true, message: "Nhập địa chỉ chi tiết" }]}
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={
                    <FormattedMessage id="admin.manage-hospital.description" />
                  }
                >
                  <MdEditor
                    value={descriptionMarkdown}
                    style={{ height: "400px" }}
                    renderHTML={(text) => mdParser.render(text)}
                    onChange={handleEditorChange}
                  />
                </Form.Item>
              </Col>

              <Col span={24} style={{ textAlign: "right" }}>
                <div className="d-flex mb-5 justify-content-end gap-2">
                  <Popconfirm
                    title="Hủy cập nhật"
                    description="Bạn có chắc muốn hủy cập nhật thông tin?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={handleCancel}
                  >
                    <Button danger>Hủy</Button>
                  </Popconfirm>
                  <Button type="primary" htmlType="submit">
                    <FormattedMessage id="admin.manage-hospital.update" />
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </TabPane>

        {/* Tab 2 - Chuyên khoa */}
        <TabPane tab="Cấu hình chuyên khoa" key="2">
          <Table
            dataSource={specialties}
            rowKey="id"
            columns={[
              { title: "Tên chuyên khoa", dataIndex: "name" },
              { title: "Mô tả", dataIndex: "descriptionMarkdown" },
            ]}
          />
        </TabPane>

        {/* Tab 3 - Lãnh đạo */}
        <TabPane tab="Cấu hình lãnh đạo" key="3">
          <Table
            dataSource={leaders}
            rowKey="id"
            columns={[
              { title: "Họ tên", dataIndex: "fullName" },
              { title: "Email", dataIndex: "email" },
              { title: "SĐT", dataIndex: "phoneNumber" },
            ]}
          />
        </TabPane>

        {/* Tab 4 - Bác sĩ */}
        <TabPane tab="Cấu hình bác sĩ" key="4">
          <Table
            dataSource={doctors}
            rowKey="id"
            columns={[
              { title: "Họ tên", dataIndex: ["doctor", "fullName"] },
              { title: "Email", dataIndex: ["doctor", "email"] },
              { title: "Chuyên khoa", dataIndex: ["specialty", "name"] },
            ]}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

export default connect(mapStateToProps)(EditHospital);
