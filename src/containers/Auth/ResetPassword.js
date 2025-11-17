import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { postResetPassword } from "../../services/userService";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

export default function ResetPassword() {
  const language = useSelector((state) => state.app.language);
  const location = useLocation();
  const history = useHistory();

  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      return message.error(
        language === "vi"
          ? "Mật khẩu xác nhận không khớp!"
          : "Passwords do not match!"
      );
    }

    setLoading(true);

    try {
      let res = await postResetPassword(token, newPassword);

      if (res && res.errCode === 0) {
        message.success(
          language === "vi"
            ? "Đặt lại mật khẩu thành công!"
            : "Password reset successfully!"
        );
        // setTimeout(() => history.push("/login"), 1500);
      } else {
        message.error(
          res?.errMessage ||
            (language === "vi" ? "Lỗi không xác định!" : "Unknown error!")
        );
      }
    } catch (error) {
      message.error(language === "vi" ? "Lỗi server!" : "Server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Card style={{ width: 400 }} className="shadow p-4 rounded">
        <Title level={3} className="text-center mb-3">
          {language === "vi" ? "Đặt lại mật khẩu" : "Reset Password"} 🔐
        </Title>

        <Text className="text-center d-block mb-4">
          {language === "vi"
            ? "Vui lòng nhập mật khẩu mới"
            : "Please enter your new password"}
        </Text>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={language === "vi" ? "Mật khẩu mới" : "New Password"}
            name="newPassword"
            rules={[
              {
                required: true,
                message:
                  language === "vi"
                    ? "Vui lòng nhập mật khẩu mới!"
                    : "Please enter new password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={
                language === "vi" ? "Nhập mật khẩu mới" : "Enter new password"
              }
            />
          </Form.Item>

          <Form.Item
            label={language === "vi" ? "Nhập lại mật khẩu" : "Confirm Password"}
            name="confirmPassword"
            rules={[
              {
                required: true,
                message:
                  language === "vi"
                    ? "Vui lòng nhập lại mật khẩu!"
                    : "Please confirm your password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={
                language === "vi" ? "Nhập lại mật khẩu" : "Confirm password"
              }
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            {language === "vi" ? "Xác nhận" : "Confirm"}
          </Button>
        </Form>

        <div className="text-center mt-3">
          <a
            onClick={() => history.push("/login")}
            style={{ cursor: "pointer" }}
          >
            {language === "vi" ? "Quay lại đăng nhập" : "Back to login"}
          </a>
        </div>
      </Card>
    </div>
  );
}
