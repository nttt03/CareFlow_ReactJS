import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Row, Col } from "antd";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../../../store/actions";

const { Option } = Select;

export default function ModalAccount({
  visible,
  onClose,
  mode,
  initialValues,
}) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const language = useSelector((state) => state.app.language);
  const roles = useSelector((state) => state.admin.roles);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (mode === "add") {
        form.setFieldsValue({ password: "123", status: "A1" });
      } else if (mode === "edit" && initialValues) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, mode, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (mode === "add") {
        const res = await dispatch(actions.createNewUser(values));
        if (res?.errCode === 0) {
          onClose();
          form.resetFields();
        }
      } else if (mode === "edit") {
        const payload = { ...values, id: initialValues.id };
        if (!payload.password) {
          delete payload.password;
        }
        const res = await dispatch(actions.editUserStart(payload));
        if (res?.errCode === 0) {
          onClose();
          form.resetFields();
        }
      }
    } catch (error) {
      console.log("Validation Failed:", error);
    }
  };

  return (
    <Modal
      title={
        mode === "add"
          ? language === "vi"
            ? "Thêm tài khoản"
            : "Add account"
          : language === "vi"
          ? "Chỉnh sửa tài khoản"
          : "Edit account"
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={language === "vi" ? "Lưu" : "Save"}
      cancelText={language === "vi" ? "Hủy" : "Cancel"}
      width={700}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={language === "vi" ? "Tên" : "Full name"}
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={language === "vi" ? "Số điện thoại" : "Phone number"}
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                { pattern: /^[0-9]+$/, message: "Chỉ được nhập số" },
              ]}
            >
              <Input
                maxLength={10}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={language === "vi" ? "Mật khẩu" : "Password"}
              name="password"
              rules={
                mode === "add"
                  ? [{ required: true, message: "Vui lòng nhập mật khẩu" }]
                  : [] // Edit: optional
              }
            >
              <Input.Password
                placeholder={
                  mode === "edit" ? "Để trống nếu không đổi mật khẩu" : ""
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={language === "vi" ? "Phân quyền" : "Role"}
              name="roleId"
              rules={[{ required: true, message: "Vui lòng chọn phân quyền" }]}
            >
              <Select placeholder="Chọn phân quyền">
                {roles?.map((r) => (
                  <Option key={r.keyMap} value={r.keyMap}>
                    {language === "vi" ? r.valueVi : r.valueEn}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={language === "vi" ? "Trạng thái" : "Status"}
              name="status"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select>
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
      </Form>
    </Modal>
  );
}
