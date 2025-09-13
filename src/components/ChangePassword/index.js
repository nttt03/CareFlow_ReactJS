import React, { useState, useRef } from "react";
import { Form, Input, Button, message, Card } from "antd";
import ReCAPTCHA from "react-google-recaptcha";
import { changePassword } from "../../services/userService";
const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef(null);

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const onFinish = async (values) => {
    if (!captchaToken) {
      message.error("Vui lòng xác thực Captcha!");
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
        message.success("Đổi mật khẩu thành công!");
      } else {
        message.error(res.errMessage || "Đổi mật khẩu thất bại!");
      }
      // message.success("Chức năng đang được phát triển!");
    } catch (err) {
      console.error(err);
      message.error("Lỗi server!");
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset(); // reset captcha
      setCaptchaToken("");
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <Card
            variant="borderless"
            title="Đổi mật khẩu"
            className="shadow-none"
          >
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Mật khẩu cũ"
                name="oldPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu cũ" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                  { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự!" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập lại mật khẩu mới!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>

              {/* reCAPTCHA */}
              <div className="flex justify-center mb-4">
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_SITE_KEY_CAPTCHA}
                  onChange={handleCaptchaChange}
                  onExpired={() => setCaptchaToken("")}
                  onErrored={() => message.error("Lỗi khi tải reCAPTCHA!")}
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
                  Đổi mật khẩu
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
