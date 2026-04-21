import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import * as actions from "../../store/actions";
import { handleLoginApi } from "../../services/userService";
import { Button } from "antd";
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

  handleLoginGoogle = () => {
    // chuyển hướng tới backend Google login
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/google`;
    
  };

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
      console.log("data: ", data)
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
            <div className="col-12 mt-3 text-center">
              <Button
                type="default"
                size="large"
                onClick={this.handleLoginGoogle}
                className="d-flex align-items-center justify-content-center gap-3 btn-google-shadow border border-light-subtle rounded-2 fw-medium text-secondary shadow-sm px-4 py-2 lh-lg my-0 mx-auto"
                style={{
                  minWidth: "250px",
                  height: "46px",
                  fontSize: "14.5px",
                }}
                hoverStyle={{
                  color: "#f03b0eff",
                  boxShadow: "0 1px 3px 1px rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)",
                }}
              >
                {/* Logo Google SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>

                <span>
                  {lang === "vi" ? "Đăng nhập với Google" : "Sign in with Google"}
                </span>
              </Button>
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
