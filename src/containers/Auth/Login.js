import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import * as actions from "../../store/actions";
import { handleLoginApi } from "../../services/userService";
import "./Auth.scss";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      isShowPassword: false,
      errMessage: "",
      isLoading: false,
    };
  }

  handleOnChangeUsername = (event) => {
    this.setState({
      username: event.target.value,
    });
  };

  handleOnChangePassword = (event) => {
    this.setState({
      password: event.target.value,
    });
  };

  handleLogin = async () => {
    this.setState({
      errMessage: "",
    });

    try {
      this.setState({ isLoading: true });
      let data = await handleLoginApi(this.state.username, this.state.password);
      if (data && data.errCode !== 0) {
        this.setState({
          errMessage:
            this.props.lang === "vi"
              ? data.message
              : data.messageEn || data.message,
        });
        this.setState({ isLoading: false });
      }
      if (data && data.errCode === 0) {
        this.props.userLoginSuccess(data.user);
      }
    } catch (e) {
      this.setState({ isLoading: false });
      let errorMsg = "Đã có lỗi xảy ra, vui lòng thử lại!";
      if (e.response && e.response.data) {
        errorMsg =
          this.props.lang === "vi"
            ? e.response.data.message
            : e.response.data.messageEn || e.response.data.message;
      }
      this.setState({
        errMessage: errorMsg,
      });
    }
  };

  handleShowHidePassword = () => {
    this.setState({
      isShowPassword: !this.state.isShowPassword,
    });
  };

  handleKeyDown = (event) => {
    if (event.key === "Enter" || event.keyCode === 13) {
      this.handleLogin();
    }
  };

  render() {
    const { lang } = this.props;

    return (
      <div className="auth-background">
        <div className="auth-container py-5 mx-3">
          <div className="auth-content row">
            <div className="col-12 text-login">
              {lang === "vi" ? "ĐĂNG NHẬP" : "LOGIN"}
            </div>

            <div className="col-12 form-group login-input">
              <label>{lang === "vi" ? "Email:" : "Email:"}</label>
              <input
                type="text"
                className="form-control"
                placeholder={lang === "vi" ? "Nhập email" : "Enter your email"}
                value={this.state.username}
                onChange={(event) => this.handleOnChangeUsername(event)}
              />
            </div>

            <div className="col-12 form-group login-input">
              <label>{lang === "vi" ? "Mật khẩu:" : "Password:"}</label>
              <div className="custom-input-password">
                <input
                  type={this.state.isShowPassword ? "text" : "password"}
                  className="form-control"
                  placeholder={
                    lang === "vi" ? "Nhập mật khẩu" : "Enter password"
                  }
                  onChange={(event) => this.handleOnChangePassword(event)}
                  onKeyDown={(event) => this.handleKeyDown(event)}
                />
                <span onClick={this.handleShowHidePassword}>
                  <i
                    className={
                      this.state.isShowPassword
                        ? "fas fa-eye"
                        : "fas fa-eye-slash"
                    }
                  ></i>
                </span>
              </div>
            </div>

            <div className="col-12 err-message">{this.state.errMessage}</div>

            <div className="col-12">
              <button
                className="btn-login"
                onClick={this.handleLogin}
                disabled={this.state.isLoading}
                style={{
                  opacity: this.state.isLoading ? 0.7 : 1,
                  cursor: this.state.isLoading ? "not-allowed" : "pointer",
                }}
              >
                {this.state.isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    {lang === "vi" ? "Đang đăng nhập..." : "Logging in..."}
                  </>
                ) : lang === "vi" ? (
                  "Đăng nhập"
                ) : (
                  "Login"
                )}
              </button>
            </div>

            <div className="col-12">
              <p className="forgot-password">
                <a href="/forgot-password">
                  {lang === "vi" ? "Quên mật khẩu?" : "Forgot password?"}
                </a>
              </p>
            </div>

            <div className="col-12">
              <p className="text-center">
                {lang === "vi" ? "Chưa có tài khoản" : "Don't have an account?"}{" "}
                <span
                  className="hover-effect fw-bold text-danger text-decoration-underline"
                  style={{ cursor: "pointer" }}
                  onClick={() => this.props.navigate("/register")}
                >
                  {lang === "vi" ? "Đăng ký ngay!" : "Register now!"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    lang: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigate: (path) => dispatch(push(path)),
    userLoginSuccess: (userInfo) =>
      dispatch(actions.userLoginSuccess(userInfo)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
