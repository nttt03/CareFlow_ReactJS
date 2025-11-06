import React, { Component } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import "./ForgotPassword.scss";
import { postForgotPassword } from "../../services/userService";

const { Title, Text } = Typography;

class ForgotPassword extends Component {
  state = {
    loading: false,
  };

  onFinish = async (values) => {
    this.setState({ loading: true });

    try {
      let res = await postForgotPassword(values.email);
      if (res && res.errCode === 0) {
        message.success(
          res.message || "Vui lòng kiểm tra email để đặt lại mật khẩu!"
        );
        setTimeout(() => this.props.navigate("/login"), 2000);
      } else {
        message.error(res.message || "Email không tồn tại!");
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi, vui lòng thử lại!");
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <div className="forgot-password-bg">
        <Card className="forgot-password-card" bordered={false}>
          <Title level={3} className="text-center mb-2">
            Quên mật khẩu
          </Title>
          <Text className="text-center d-block mb-4">
            Nhập email để nhận link đặt lại mật khẩu
          </Text>

          <Form layout="vertical" onFinish={this.onFinish}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email của bạn"
                size="large"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={this.state.loading}
            >
              Gửi yêu cầu
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Text>
              <span
                style={{ cursor: "pointer", color: "#1890ff" }}
                onClick={() => this.props.navigate("/login")}
              >
                Quay lại đăng nhập
              </span>
            </Text>
          </div>
        </Card>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
  };
};

export default connect(null, mapDispatchToProps)(ForgotPassword);
