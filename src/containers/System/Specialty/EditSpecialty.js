import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Form,
  Input,
  Upload,
  Image,
  Button,
  Spin,
  Row,
  Col,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import markdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { CommonUtils } from "../../../utils";
import {
  getAllDetailSpecialty,
  updateSpecialty,
} from "../../../services/userService";
import { FormattedMessage } from "react-intl";
import { useParams, useHistory } from "react-router-dom";
import { toast } from "react-toastify";

const { Option } = Select;
const mdParser = new markdownIt();

function EditSpecialty({ language }) {
  const { specialtyId } = useParams();
  const history = useHistory();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [status, setStatus] = useState("");

  // Load dữ liệu khi edit
  useEffect(() => {
    const fetchData = async () => {
      if (!specialtyId) return;
      setLoading(true);
      try {
        const res = await getAllDetailSpecialty(specialtyId);
        if (res && res.errCode === 0) {
          const data = res.data;
          form.setFieldsValue({
            name: data.name,
            status: data.status,
          });
          setImageBase64(data.image || "");
          setDescriptionMarkdown(data.descriptionMarkdown || "");
          setDescriptionHTML(data.descriptionHTML || "");
          setStatus(data.status || "");
        } else {
          toast.error("Không tìm thấy chuyên khoa!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi khi tải dữ liệu chuyên khoa!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [specialtyId, form]);

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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        id: specialtyId,
        name: values.name,
        status: values.status,
        imageBase64,
        descriptionMarkdown,
        descriptionHTML,
      };
      const res = await updateSpecialty(payload);
      if (res && res.errCode === 0) {
        toast.success("Cập nhật chuyên khoa thành công!");
        setTimeout(() => {
          history.push("/system/manage-specialty");
        }, 1000);
        return;
      } else {
        toast.error("Lỗi khi cập nhật chuyên khoa!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Vui lòng điền đầy đủ thông tin!");
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="px-3 edit-specialty-container">
        <h2 className="title">
          <FormattedMessage id="admin.manage-specialty.title-edit" />
        </h2>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            {/* Tên chuyên khoa */}
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <FormattedMessage id="admin.manage-specialty.name-specialty" />
                }
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên chuyên khoa!" },
                ]}
              >
                <Input placeholder="Nhập tên chuyên khoa" />
              </Form.Item>
            </Col>

            {/* Trạng thái */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: "Chọn trạng thái!" }]}
              >
                <Select
                  placeholder="Chọn trạng thái"
                  onChange={(value) => setStatus(value)}
                  value={status}
                >
                  <Option value="A1">
                    {language === "vi" ? "Đang hoạt động" : "Active"}
                  </Option>
                  <Option value="A2">
                    {language === "vi" ? "Ngừng hoạt động" : "Inactive"}
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Upload ảnh */}
          <Form.Item
            label={
              <FormattedMessage id="admin.manage-hospital.img-specialty" />
            }
            name="image"
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
              >
                <Button icon={<UploadOutlined />}>
                  <FormattedMessage id="admin.manage-hospital.upload" />
                </Button>
              </Upload>
            </div>
          </Form.Item>

          {/* Editor */}
          <Form.Item label="Mô tả chi tiết">
            <MdEditor
              value={descriptionMarkdown}
              style={{ height: "400px" }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={handleEditorChange}
            />
          </Form.Item>

          {/* Nút Save */}
          <Form.Item>
            <Button type="primary" onClick={handleSave}>
              <FormattedMessage id="admin.manage-specialty.save" />
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

export default connect(mapStateToProps)(EditSpecialty);
