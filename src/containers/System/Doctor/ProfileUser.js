import React, { useEffect, useState } from "react";
import {
  Image,
  Button,
  Popconfirm,
  Alert,
  Form,
  Input,
  DatePicker,
  Radio,
  Select,
  Row,
  Col,
  Divider,
  Upload,
  message,
} from "antd";
import {
  getInfoUser,
  getAllProvince,
  updateInfoByUser,
} from "../../../services/userService";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../../store/actions";
import { useParams } from "react-router-dom";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import { validateCCCD } from "../../../utils";

const { Option } = Select;

const ProfileUser = () => {
  const { id } = useParams();
  const patientId = id;
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [form] = Form.useForm();
  const [provinces, setProvinces] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [fileList, setFileList] = useState([]);
  const language = useSelector((state) => state.app.language);

  const fetchUserInfo = async () => {
    if (!patientId) return;
    try {
      dispatch(showLoading());
      const res = await getInfoUser(patientId);
      if (res && res.data) {
        setFormData(res.data);
        form.setFieldsValue({
          fullName: res.data.fullName,
          phoneNumber: res.data.phoneNumber,
          dateOfBirth: res.data.dateOfBirth
            ? dayjs(res.data.dateOfBirth)
            : null,
          gender: res.data.genderData?.valueVi === "Nam" ? "male" : "female",
          addressDetail: res.data.addressDetail,
          email: res.data.email,
          CCCD: res.data.CCCD,
          provinceId: res.data.provinceId || null,
          avatar: res.data.avatar || null,
        });
        setAvatarPreview(res.data.avatar);
      }
    } catch (error) {
      console.error("Lỗi khi fetch user info:", error);
    } finally {
      setTimeout(() => {
        dispatch(hideLoading());
      }, 500);
    }
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

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchUserInfo();
    }
  }, [patientId]);

  const handleAvatarChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList[0]?.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setAvatarPreview(base64String);
        setAvatarBase64(base64String);
        form.setFieldsValue({ avatar: base64String });
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    }
  };

  const handleSubmit = async (values) => {
    try {
      dispatch(showLoading());

      if (!validateCCCD(values.CCCD)) {
        message.error("Số CCCD không hợp lệ!");
        return;
      }

      const updatedData = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
        gender: values.gender === "male" ? "M" : "F",
        addressDetail: values.addressDetail,
        email: values.email,
        CCCD: values.CCCD,
        provinceId: values.provinceId,
        avatar: avatarBase64 || formData.avatar,
      };

      const res = await updateInfoByUser(updatedData);

      if (res && res.errCode === 0) {
        message.success(
          language === "vi"
            ? "Cập nhật thông tin thành công!"
            : "Information updated successfully!"
        );
        setFormData({ ...res.data, avatar: res.data.avatar });
        setAvatarPreview(res.data.avatar); // Cập nhật preview từ server
        setAvatarBase64(null); // Reset base64
        setIsEditing(false);
      } else {
        message.error(
          language === "vi" ? "Cập nhật thất bại!" : "Update failed!"
        );
      }
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      message.error(
        language === "vi"
          ? "Có lỗi xảy ra khi cập nhật thông tin!"
          : "An error occurred while updating information!"
      );
    } finally {
      dispatch(hideLoading());
    }
  };

  // Hàm kiểm tra thông tin có đủ không
  const isInfoIncomplete = () => {
    return (
      !formData?.fullName ||
      !formData?.phoneNumber ||
      !formData?.dateOfBirth ||
      !formData?.genderData?.valueVi ||
      !formData?.addressDetail ||
      !formData?.email ||
      !formData?.CCCD
    );
  };

  if (!formData)
    return (
      <p>{language === "vi" ? "Không có dữ liệu người dùng" : "No data"}</p>
    );

  return (
    <div className="container my-4">
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
        <div>
          <h4 className="text-uppercase px-3 py-2 border border-primary rounded-3 d-inline-block">
            {isEditing
              ? language === "vi"
                ? "Cập nhật hồ sơ"
                : "Update profile"
              : language === "vi"
              ? "Hồ sơ cá nhân"
              : "Personal profile"}
          </h4>
          <h5 className="text-primary text-uppercase px-3">
            {formData?.fullName || "---"}
          </h5>
        </div>
        {isInfoIncomplete() && (
          <Alert
            message={
              language === "vi"
                ? "Hoàn thiện thông tin của bạn để đầy đủ thông tin hồ sơ."
                : "Complete information manage records better"
            }
            type="warning"
            showIcon
            style={{ marginBottom: "16px" }}
          />
        )}
        <div>
          <Image
            className="border border-5 border-gray rounded-circle"
            width={100}
            height={100}
            style={{
              objectFit: "cover",
              borderRadius: "50%",
            }}
            preview={{
              mask: language === "vi" ? "Xem trước" : "Preview",
              maskClassName: "rounded-circle",
            }}
            src={
              avatarPreview ||
              formData?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            fallback={<UserOutlined />}
          />
        </div>
      </div>
      <div className="my-2 border-bottom border-2 border-gray" />

      {!isEditing ? (
        <>
          {/* Thông tin cơ bản */}
          <div className="p-3">
            <h5 className="mb-3 fw-bold text-warning">
              {language === "vi" ? "Thông tin cơ bản" : "Basic information"}
            </h5>
            <div className="row mb-2 border-bottom py-2">
              <div className="col-4 fw-semibold">
                <FormattedMessage id="profile.person-profile.fullName" />
              </div>
              <div className="col-8 text-uppercase">
                {formData?.fullName || "---"}
              </div>
            </div>
            <div className="row mb-2 border-bottom py-2">
              <div className="col-4 fw-semibold">
                <FormattedMessage id="profile.person-profile.phone" />
              </div>
              <div className="col-8">{formData?.phoneNumber || "---"}</div>
            </div>
            <div className="row mb-2 border-bottom py-2">
              <div className="col-4 fw-semibold">
                <FormattedMessage id="profile.person-profile.dob" />
              </div>
              <div className="col-8">
                {formData?.dateOfBirth
                  ? dayjs(formData.dateOfBirth).format("DD-MM-YYYY")
                  : "---"}
              </div>
            </div>
            <div className="row mb-2 border-bottom py-2">
              <div className="col-4 fw-semibold">
                <FormattedMessage id="profile.person-profile.gender" />
              </div>
              <div className="col-8">
                {formData?.genderData?.valueVi || "---"}
              </div>
            </div>
            <div className="row mb-2 border-bottom py-2">
              <div className="col-4 fw-semibold">
                <FormattedMessage id="profile.person-profile.address" />
              </div>
              <div className="col-8">{formData?.addressDetail || "---"}</div>
            </div>
            <div className="row mb-2 border-bottom py-2">
              <div className="col-4 fw-semibold">
                <FormattedMessage id="profile.person-profile.city" />
              </div>
              <div className="col-8">
                {formData?.provinceData?.name || "---"}
              </div>
            </div>
          </div>

          {/* Thông tin bổ sung */}
          <div className="p-3">
            <h5 className="mb-3 fw-bold text-warning">
              <FormattedMessage id="profile.person-profile.title2" />
            </h5>
            <div className="row mb-2 border-bottom py-2">
              <div className="col-4 fw-semibold">
                <FormattedMessage id="profile.person-profile.email" />
              </div>
              <div className="col-8">{formData?.email || "---"}</div>
            </div>
            <div className="row mb-2 border-bottom py-2">
              <div className="col-4 fw-semibold">
                <FormattedMessage id="profile.person-profile.cccd" />
              </div>
              <div className="col-8">{formData?.CCCD || "---"}</div>
            </div>
          </div>

          <Button
            style={{ float: "right" }}
            type="primary"
            onClick={() => setIsEditing(true)}
          >
            <FormattedMessage id="profile.person-profile.btn-update" />
          </Button>
        </>
      ) : (
        <>
          <Divider orientation="left">
            <FormattedMessage id="profile.person-profile.title3" />
          </Divider>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              gender: "female",
            }}
          >
            <Row gutter={16}>
              <Col span={6} className="d-flex justify-content-center">
                <Form.Item name="avatar">
                  <Upload
                    listType="picture-circle"
                    showUploadList={false}
                    beforeUpload={() => false}
                    fileList={fileList}
                    onChange={handleAvatarChange}
                    style={{
                      width: 70,
                      height: 70,
                    }}
                  >
                    {avatarPreview || formData?.avatar ? (
                      <img
                        src={avatarPreview || formData.avatar}
                        alt="avatar"
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>
                          <FormattedMessage id="profile.person-profile.loadimg" />
                        </div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              {/* thông tin */}
              <Col span={18}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <FormattedMessage id="profile.person-profile.fullName" />
                      }
                      name="fullName"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage id="profile.person-profile.requiredName" />
                          ),
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <FormattedMessage id="profile.person-profile.phone" />
                      }
                      name="phoneNumber"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage id="profile.person-profile.requiredPhone" />
                          ),
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <FormattedMessage id="profile.person-profile.dob" />
                      }
                      name="dateOfBirth"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage id="profile.person-profile.requiredDob" />
                          ),
                        },
                      ]}
                    >
                      <DatePicker
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <FormattedMessage id="profile.person-profile.gender" />
                      }
                      name="gender"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage id="profile.person-profile.requiredGender" />
                          ),
                        },
                      ]}
                    >
                      <Radio.Group>
                        <Radio value="male">
                          {language === "vi" ? "Nam" : "Male"}
                        </Radio>
                        <Radio value="female">
                          {language === "vi" ? "Nữ" : "Female"}
                        </Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <FormattedMessage id="profile.person-profile.email" />
                      }
                      name="email"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage id="profile.person-profile.requireEmail" />
                          ),
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <FormattedMessage id="profile.person-profile.cccd" />
                      }
                      name="CCCD"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage id="profile.person-profile.requiredCccd" />
                          ),
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <FormattedMessage id="profile.person-profile.address" />
                      }
                      name="addressDetail"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage id="profile.person-profile.requiredAddress" />
                          ),
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <FormattedMessage id="profile.person-profile.city" />
                      }
                      name="provinceId"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage id="profile.person-profile.requiredCity" />
                          ),
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder={
                          <FormattedMessage id="profile.person-profile.placeholder" />
                        }
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option?.children
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      >
                        {provinces.map((province) => (
                          <Option key={province.id} value={province.id}>
                            {province.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2">
                  <Popconfirm
                    title={
                      <FormattedMessage id="profile.person-profile.popTitle" />
                    }
                    description={
                      <FormattedMessage id="profile.person-profile.popDes" />
                    }
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => setIsEditing(false)}
                  >
                    <Button danger>
                      {<FormattedMessage id="profile.person-profile.cancel" />}
                    </Button>
                  </Popconfirm>
                  <Button type="primary" htmlType="submit">
                    {<FormattedMessage id="profile.person-profile.save" />}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </div>
  );
};

export default ProfileUser;
