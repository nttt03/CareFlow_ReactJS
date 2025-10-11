import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import "./HomeHeader.scss";
import { LANGUAGES } from "../../utils";
import { changeLanguageApp } from "../../store/actions";
import { withRouter } from "react-router";
import * as actions from "../../store/actions";
import { injectIntl } from "react-intl";
import {
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Dropdown, Badge, message } from "antd";
import { getNotifications, markAsRead } from "../../services/userService";
import { io } from "socket.io-client";

class HomeHeader extends Component {
  socket = null;
  constructor(props) {
    super(props);
    this.state = {
      mobileMenu: false,
      notifications: [],
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  loadNotifications = async () => {
    const { userInfo } = this.props;
    if (userInfo && userInfo.id && userInfo.roleId) {
      try {
        const res = await getNotifications(userInfo.id, userInfo.roleId);
        if (res && res.data && res.errCode === 0) {
          this.setState({
            notifications: res.data || [],
          });
        }
      } catch (e) {
        console.log("Lỗi load notification:", e);
      }
    }
  };

  componentDidMount() {
    const { userInfo } = this.props;
    this.loadNotifications();

    if (userInfo?.id && userInfo?.roleId === "R3") {
      this.socket = io(process.env.REACT_APP_BACKEND_URL, {
        withCredentials: true,
      });

      this.socket.emit("joinCustomerRoom", userInfo.id);

      this.socket.on("new-notification", (data) => {
        message.info("Bạn có thông báo mới!");
        this.setState((prevState) => {
          const exists = prevState.notifications.some(
            (notif) => notif.id === data.id
          );
          if (!exists) {
            return {
              notifications: [data, ...prevState.notifications],
            };
          }
          return prevState;
        });
      });
    }
  }

  componentWillUnmount() {
    if (this.socket && this.props.userInfo?.id) {
      this.socket.emit("leaveCustomerRoom", this.props.userInfo.id);
      this.socket.disconnect();
    }
  }

  handleNotificationClick = async (url, notificationId) => {
    try {
      const res = await markAsRead(notificationId);
      if (res && res.errCode === 0) {
        this.setState((prevState) => ({
          notifications: prevState.notifications.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          ),
        }));
        await this.loadNotifications();
      }
      if (url) {
        this.props.history.push(url);
      }
    } catch (e) {
      console.log("Lỗi khi đánh dấu thông báo đã đọc:", e);
    }
  };

  changeLanguage = (language) => {
    // alert(language)
    // fire redux event : actions
    this.props.changeLanguageAppRedux(language);
  };

  returnToHome = () => {
    if (this.props.history) {
      this.props.history.push(`/home`);
    }
  };

  handleViewListSpecialty = () => {
    if (this.props.history) {
      this.props.history.push(`/list-specialty`);
    }
  };

  handleViewListHospital = () => {
    if (this.props.history) {
      this.props.history.push(`/list-hospital`);
    }
  };

  handleViewListDoctor = () => {
    if (this.props.history) {
      this.props.history.push(`/list-doctor`);
    }
  };

  handleViewNewAppointment = () => {
    if (this.props.history) {
      this.props.history.push(`/new-appointment`);
    }
  };

  handleViewHome = () => {
    if (this.props.history) {
      this.props.history.push(`/home`);
    }
  };

  toggleMenu = () => {
    this.setState((prevState) => ({
      mobileMenu: !prevState.mobileMenu,
    }));
  };

  render() {
    const currentPath = this.props.location.pathname;
    const { intl } = this.props;
    const placeholderText = intl.formatMessage({ id: "banner.placeholder" });
    // console.log('check: ', this.props)
    let language = this.props.language;
    const { userInfo, processLogout, isLoggedIn } = this.props;

    const handleLogout = () => {
      processLogout();
      this.props.history.push("/home");
    };

    const baseTabs = [
      {
        key: "info",
        label: "Hồ sơ cá nhân",
        path: null,
        icon: <UserOutlined />,
      },
      {
        key: "favorites",
        label: "Danh sách yêu thích",
        path: null,
        icon: <UserOutlined />,
      },
      {
        key: "changePassword",
        label: "Đổi mật khẩu",
        path: null,
        icon: <LockOutlined />,
      },
    ];
    const sideBarTabs = [...baseTabs];
    if (isLoggedIn && userInfo) {
      sideBarTabs[0].path = `profile-user/${userInfo.id}?tab=info`;
      sideBarTabs[1].path = `profile-user/${userInfo.id}?tab=favorites`;
      sideBarTabs[2].path = `profile-user/${userInfo.id}?tab=changePassword`;
      sideBarTabs.push({
        key: "logout",
        label: "Đăng xuất",
        onClick: handleLogout,
        icon: <LogoutOutlined />,
      });
    }
    // console.log("check userInfo: ", userInfo);
    return (
      <React.Fragment>
        <div className="home-header-container">
          <div className="home-header-content gap-3">
            <div className="left-content">
              <i
                className="fas fa-bars menu-icon"
                onClick={() => this.toggleMenu()}
              ></i>
              <div
                className="header-logo"
                onClick={() => this.returnToHome()}
              ></div>
            </div>
            <div
              className={`center-content text-uppercase ${
                !this.state.mobileMenu ? "hide-mobile-menu" : ""
              }`}
            >
              <div
                className={`child-content ${
                  currentPath === "/home" ? "active" : ""
                }`}
                onClick={() => this.handleViewHome()}
              >
                <div className="sub-title">
                  <b>
                    <FormattedMessage id="homeheader.home" />
                  </b>
                </div>
              </div>
              <div
                className={`child-content ${
                  currentPath === "/list-specialty" ? "active" : ""
                }`}
                onClick={() => this.handleViewListSpecialty()}
              >
                <div className="sub-title">
                  <b>
                    <FormattedMessage id="homeheader.speciality" />
                  </b>
                </div>
                <div className="subs-title">
                  <FormattedMessage id="homeheader.search-doctor" />
                </div>
              </div>
              <div
                className={`child-content ${
                  currentPath === "/list-hospital" ? "active" : ""
                }`}
                onClick={() => this.handleViewListHospital()}
              >
                <div className="sub-title">
                  <b>
                    <FormattedMessage id="homeheader.health-facility" />
                  </b>
                </div>
                <div className="subs-title">
                  <FormattedMessage id="homeheader.select-room" />
                </div>
              </div>
              <div
                className={`child-content ${
                  currentPath === "/list-doctor" ? "active" : ""
                }`}
                onClick={() => this.handleViewListDoctor()}
              >
                <div className="sub-title">
                  <b>
                    <FormattedMessage id="homeheader.doctor" />
                  </b>
                </div>
                <div className="subs-title">
                  <FormattedMessage id="homeheader.select-doctor" />
                </div>
              </div>
              <div
                className={`child-content ${
                  currentPath === "/new-appointment" ? "active" : ""
                }`}
                onClick={() => this.handleViewNewAppointment()}
              >
                <div className="sub-title">
                  <b>
                    <FormattedMessage id="homeheader.package" />
                  </b>
                </div>
                <div className="subs-title">
                  <FormattedMessage id="homeheader.check-health" />
                </div>
              </div>
            </div>
            <div className="right-content">
              {isLoggedIn && this.state.notifications && (
                <div className="notification-wrapper">
                  <Dropdown
                    trigger={["click"]}
                    menu={{
                      items: this.state.notifications.map((item) => ({
                        key: item.id,
                        label: (
                          <div
                            onClick={() =>
                              this.handleNotificationClick(item.url, item.id)
                            }
                            style={{
                              fontWeight: item.isRead ? "normal" : "bold",
                            }}
                          >
                            {item.message}
                          </div>
                        ),
                      })),
                    }}
                  >
                    <Badge
                      count={
                        this.state.notifications.filter((n) => !n.isRead).length
                      }
                      offset={[-16, 2]}
                    >
                      <BellOutlined
                        style={{
                          fontSize: "22px",
                          cursor: "pointer",
                          marginRight: 20,
                          color: "blue",
                        }}
                      />
                    </Badge>
                  </Dropdown>
                </div>
              )}

              {isLoggedIn ? (
                <div className="sign-in-out-content">
                  <span className="text-nowrap">
                    <FormattedMessage id="homeheader.welcome" />,{" "}
                    <strong className="text-success">
                      {userInfo && userInfo.fullName ? userInfo.fullName : ""}
                    </strong>
                  </span>
                  <img
                    className="avatar object-fit-cover rounded-circle border border-2 border-primary"
                    alt="avatar"
                    src={
                      userInfo && userInfo.avatar
                        ? `${userInfo.avatar}`
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                  />
                  <div className="sub-menu rounded-2 shadow-md">
                    {sideBarTabs.map((tab) => (
                      <div
                        className="sub-menu-item"
                        key={tab.key}
                        icon={tab.icon}
                        onClick={() =>
                          tab.onClick
                            ? tab.onClick()
                            : this.props.history.push(`/${tab.path}`)
                        }
                      >
                        {tab.label}
                      </div>
                    ))}
                    <div className="sub-menu-item language-content">
                      <div
                        className={
                          language === LANGUAGES.VI
                            ? "language-vi active"
                            : "language-vi"
                        }
                      >
                        <span onClick={() => this.changeLanguage(LANGUAGES.VI)}>
                          VN
                        </span>
                      </div>
                      <div
                        className={
                          language === LANGUAGES.EN
                            ? "language-en active"
                            : "language-en"
                        }
                      >
                        <span onClick={() => this.changeLanguage(LANGUAGES.EN)}>
                          EN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sign-in-out-content text-nowrap">
                  <div
                    className="btn btn-login"
                    onClick={() => this.props.history.push("/login")}
                  >
                    <FormattedMessage
                      id="homeheader.login"
                      defaultMessage="Sign in"
                    />
                  </div>
                  <div
                    className="btn btn-register"
                    onClick={() => this.props.history.push("/register")}
                  >
                    <FormattedMessage
                      id="homeheader.register"
                      defaultMessage="Sign up"
                    />
                  </div>
                </div>
              )}

              {/* <div className='support'><i className="fas fa-question-circle me-2"></i><FormattedMessage id="homeheader.support" /></div> */}
            </div>
          </div>
        </div>
        {this.props.isShowBanner === true && (
          <div className="home-header-banner">
            <div className="content-up">
              <div className="title1">
                <FormattedMessage id="banner.title1" />
              </div>
              <div className="title2">
                <FormattedMessage id="banner.title2" />
              </div>
              <div className="search">
                <i className="fas fa-search"></i>
                <input type="text" placeholder={placeholderText} />
              </div>
            </div>
            <div className="content-down">
              <div className="options">
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-hospital"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child1" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-mobile-alt"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child2" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-stethoscope"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child3" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-notes-medical"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child4" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-sun"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child5" />
                  </div>
                </div>
                <div className="option-child">
                  <div className="icon-child">
                    <i className="fas fa-plus-circle"></i>
                  </div>
                  <div className="text-child">
                    <FormattedMessage id="banner.child6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    language: state.app.language,
    userInfo: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    processLogout: () => dispatch(actions.processLogout()),
    // fire 1 action redux (action là changeLanguageApp đầu vào là language)
    changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language)),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(HomeHeader))
);
