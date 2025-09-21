import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import markdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import { CommonUtils } from "../../../utils";
import {
  createNewHospital,
  getAllProvince,
} from "../../../services/userService";
import { toast } from "react-toastify";
import { FormattedMessage } from "react-intl";
import { Form, Input, Select, Upload, Button, Row, Col, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;
const mdParser = new markdownIt();

function AddHospital({ language }) {
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [imageBase64, setImageBase64] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");

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

  useEffect(() => {
    fetchProvinces();
  }, []);

  const handleEditorChange = ({ html, text }) => {
    setDescriptionMarkdown(text);
    setDescriptionHTML(html);
  };

  const handleOnChangeImage = async (info) => {
    // console.log("Upload info:", info);
    const latestFile = info.fileList[info.fileList.length - 1];
    // console.log("Latest file:", latestFile);
    if (latestFile?.originFileObj) {
      const base64 = await CommonUtils.getBase64(latestFile.originFileObj);
      // console.log("Base64 length:", base64.length);
      setImageBase64(base64);
    } else {
      setImageBase64("");
    }
  };

  const handleSaveHospital = async (values) => {
    const hospitalData = {
      ...values,
      imageBase64,
      descriptionHTML,
      descriptionMarkdown,
    };

    let res = await createNewHospital(hospitalData);
    if (res && res.errCode === 0) {
      toast.success("Thêm mới bệnh viện thành công!");
      form.resetFields();
      setImageBase64("");
      setDescriptionHTML("");
      setDescriptionMarkdown("");
    } else if (res && res.errCode === 1) {
      toast.warn("Vui lòng điền đầy đủ thông tin và tải ảnh!");
    } else {
      toast.error("Lỗi khi thêm mới bệnh viện!");
      console.log("check res-err: ", res);
    }
  };

  return (
    <div className="container mt-3 manage-hospital-container">
      <div className="title py-2">
        <FormattedMessage id="admin.manage-hospital.title-add" />
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveHospital}
        initialValues={{ provinceId: provinces?.[0]?.id }}
      >
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
              name="image" // Thêm name để liên kết với form
              rules={[
                {
                  required: true,
                  message: <FormattedMessage id="Vui lòng tải ảnh" />,
                },
              ]}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                  // Thêm value để form có thể theo dõi giá trị
                  fileList={
                    imageBase64
                      ? [
                          {
                            uid: "-1",
                            name: "image.png",
                            status: "done",
                            url: imageBase64,
                          },
                        ]
                      : []
                  }
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
              label={<FormattedMessage id="admin.manage-hospital.province" />}
              rules={[{ required: true, message: "Chọn tỉnh/thành phố" }]}
            >
              <Select
                placeholder="------"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
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
              label={<FormattedMessage id="admin.manage-hospital.address" />}
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
            <Button type="primary" htmlType="submit">
              <FormattedMessage id="admin.manage-hospital.save" />
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

export default connect(mapStateToProps)(AddHospital);
