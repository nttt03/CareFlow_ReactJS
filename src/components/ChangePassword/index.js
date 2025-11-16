import React, { useState, useRef } from "react";
import { Form, Input, Button, message, Card } from "antd";
import ReCAPTCHA from "react-google-recaptcha";
import { changePassword } from "../../services/userService";
import { useSelector } from "react-redux";

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef(null);
  const language = useSelector((state) => state.app.language);

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const onFinish = async (values) => {
    if (!captchaToken) {
      message.error(
        language === "vi"
          ? "Vui lòng xác thực Captcha!"
          : "Please verify Captcha!"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        captchaToken, // gửi kèm captcha token lên server nếu bạn muốn verify phía backend
      });

      if (res.errCode === 0) {
        message.success(
          language === "vi"
            ? "Đổi mật khẩu thành công!"
            : "Password changed successfully!"
        );
      } else if (res.errCode === 3) {
        message.error(
          language === "vi"
            ? "Mật khẩu hiện tại không đúng!"
            : "Current password is incorrect!"
        );
      } else {
        message.error(
          language === "vi"
            ? "Đổi mật khẩu thất bại!"
            : "Password change failed!"
        );
      }
    } catch (err) {
      console.error(err);
      message.error(language === "vi" ? "Lỗi server!" : "Server error!");
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset(); // reset captcha
      setCaptchaToken("");
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <Card
            variant="borderless"
            title={language === "vi" ? "Đổi mật khẩu" : "Change password"}
            className="shadow-none"
          >
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label={language === "vi" ? "Mật khẩu cũ" : "Old password"}
                name="oldPassword"
                rules={[
                  {
                    required: true,
                    message:
                      language === "vi"
                        ? "Vui lòng nhập mật khẩu cũ!"
                        : "Please enter old password!",
                  },
                ]}
              >
                <Input.Password
                  placeholder={
                    language === "vi"
                      ? "Nhập mật khẩu cũ"
                      : "Enter old password"
                  }
                />
              </Form.Item>

              <Form.Item
                label={language === "vi" ? "Mật khẩu mới" : "New password"}
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message:
                      language === "vi"
                        ? "Vui lòng nhập mật khẩu mới!"
                        : "Please enter new password!",
                  },
                  {
                    min: 6,
                    message:
                      language === "vi"
                        ? "Mật khẩu phải ít nhất 6 ký tự!"
                        : "Password must be at least 6 characters!",
                  },
                ]}
              >
                <Input.Password
                  placeholder={
                    language === "vi"
                      ? "Nhập mật khẩu mới"
                      : "Enter a new password"
                  }
                />
              </Form.Item>

              <Form.Item
                label={
                  language === "vi" ? "Xác nhận mật khẩu" : "Confirm password"
                }
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  {
                    required: true,
                    message:
                      language === "vi"
                        ? "Vui lòng nhập lại mật khẩu mới!"
                        : "Please re-enter new password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          language === "vi"
                            ? "Mật khẩu xác nhận không khớp!"
                            : "Confirmation password does not match!"
                        )
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder={
                    language === "vi"
                      ? "Nhập lại mật khẩu mới"
                      : "Re-enter new password"
                  }
                />
              </Form.Item>

              {/* reCAPTCHA */}
              <div className="flex justify-center mb-4">
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_SITE_KEY_CAPTCHA}
                  onChange={handleCaptchaChange}
                  onExpired={() => setCaptchaToken("")}
                  onErrored={() =>
                    message.error(
                      language === "vi"
                        ? "Lỗi khi tải reCAPTCHA!"
                        : "Error loading reCAPTCHA!"
                    )
                  }
                  ref={recaptchaRef}
                />
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  disabled={!captchaToken}
                >
                  {language === "vi" ? "Đổi mật khẩu" : "Change password"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
