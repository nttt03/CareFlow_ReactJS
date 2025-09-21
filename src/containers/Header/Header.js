import React, { Component } from "react";
import { connect } from "react-redux";

import * as actions from "../../store/actions";
import Navigator from "../../components/Navigator";
import { adminMenu, doctorMenu } from "./menuApp";
import "./Header.scss";
import { LANGUAGES, USER_ROLE } from "../../utils";
import { changeLanguageApp } from "../../store/actions";
import { FormattedMessage } from "react-intl";
import _ from "lodash";
import { Avatar } from "antd";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuApp: [],
    };
  }
  changeLanguage = (language) => {
    // alert(language)
    // fire redux event : actions
    this.props.changeLanguageAppRedux(language);
  };

  componentDidMount() {
    let { userInfo } = this.props;
    let menu = [];
    if (userInfo && !_.isEmpty(userInfo)) {
      let role = userInfo.roleId;
      if (role === USER_ROLE.ADMIN) {
        menu = adminMenu;
        console.log("Admin Menu Set");
      }
      if (role === USER_ROLE.DOCTOR) {
        menu = doctorMenu;
        console.log("Doctor Menu Set");
      }
    } else {
      console.log("User roleId not found!");
    }
    this.setState({ menuApp: menu });
  }

  getRoleName(role) {
    switch (role) {
      case "R1":
        return this.props.language === "vi" ? "Quản trị viên" : "Admin";
      case "R2":
        return this.props.language === "vi" ? "Bác sĩ" : "Doctor";
      case "R3":
        return this.props.language === "vi" ? "Khách hàng" : "Customer";
      case "R4":
        return this.props.language === "vi"
          ? "Lãnh đạo bệnh viện"
          : "Leader hospital";
    }
  }

  render() {
    const { processLogout, language, userInfo } = this.props;
    return (
      <React.Fragment>
        <div className="header">
          <div className="logo-header"></div>

          <div className="languages">
            <div className="d-flex gap-2 align-items-center me-2">
              <Avatar
                src={userInfo.avatar || "/defaultimg.png"}
                size={40}
                className="border border-1 border-warning"
              />
              <div className="user-box">
                <span className="welcome">
                  <FormattedMessage id="homeheader.welcome" />,{" "}
                  <span className="username no-wrap">
                    {userInfo && userInfo.fullName ? userInfo.fullName : ""}
                  </span>
                </span>
                <span className={`role-badge mt-1 ${userInfo.roleId}`}>
                  {this.getRoleName(userInfo.roleId)}
                </span>
              </div>
            </div>

            <div
              className={
                language === LANGUAGES.VI ? "language-vi active" : "language-vi"
              }
            >
              <span onClick={() => this.changeLanguage(LANGUAGES.VI)}>VN</span>
            </div>
            <div
              className={
                language === LANGUAGES.EN ? "language-en active" : "language-en"
              }
            >
              <span onClick={() => this.changeLanguage(LANGUAGES.EN)}>EN</span>
            </div>
          </div>

          {/* nút logout */}
          <div className="btn btn-logout" onClick={processLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  // console.log("Redux state:", state);
  return {
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    processLogout: () => dispatch(actions.processLogout()),
    // fire 1 action redux (action là changeLanguageApp đầu vào là language)
    changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
