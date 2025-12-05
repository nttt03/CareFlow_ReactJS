import React, { Component } from "react";
import { connect } from "react-redux";
import * as actions from "../../store/actions";
// import Navigator from "../../components/Navigator";
import { adminMenu, doctorMenu, leaderHospitalMenu } from "./menuApp";
import "./Header.scss";
import { LANGUAGES, USER_ROLE } from "../../utils";
import { changeLanguageApp } from "../../store/actions";
import { FormattedMessage } from "react-intl";
import _ from "lodash";
import { Avatar, Badge, Dropdown, message } from "antd";
import { CrownTwoTone, BellOutlined, LogoutOutlined } from "@ant-design/icons";
import { getNotifications, markAsRead } from "../../services/userService";
import { io } from "socket.io-client";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

class Header extends Component {
  socket = null;
  constructor(props) {
    super(props);
    this.state = {
      menuApp: [],
      notifications: [],
    };
  }

  changeLanguage = (language) => {
    this.props.changeLanguageAppRedux(language);
  };

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
    let { userInfo } = this.props;
    this.loadNotifications();

    if (userInfo?.id && userInfo?.roleId) {
      this.socket = io(process.env.REACT_APP_BACKEND_URL, {
        withCredentials: true,
      });

      // Join room dựa trên role
      if (userInfo.roleId === USER_ROLE.DOCTOR) {
        this.socket.emit("joinDoctorRoom", userInfo.id);
      } else if (userInfo.roleId === USER_ROLE.ADMIN) {
        this.socket.emit("joinAdminRoom", userInfo.id);
      } else if (userInfo.roleId === USER_ROLE.CUSTOMER) {
        this.socket.emit("joinCustomerRoom", userInfo.id);
      } else if (userInfo.roleId === USER_ROLE.LEADER) {
        this.socket.emit("joinLeaderRoom", userInfo.id);
      }

      // 3. Lắng nghe thông báo real-time
      this.socket.on("new-notification", (data) => {
        message.info("Bạn nhận được 1 thông báo mới");
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

    let menu = [];
    if (userInfo && !_.isEmpty(userInfo)) {
      let role = userInfo.roleId;
      if (role === USER_ROLE.ADMIN) {
        menu = adminMenu;
      }
      if (role === USER_ROLE.DOCTOR) {
        menu = doctorMenu;
      }
      if (role === USER_ROLE.LEADER) {
        menu = leaderHospitalMenu;
      }
    }
    this.setState({ menuApp: menu });
  }

  componentWillUnmount() {
    if (this.socket && this.props.userInfo?.id) {
      const { userInfo } = this.props;
      if (userInfo.roleId === USER_ROLE.DOCTOR) {
        this.socket.emit("leaveDoctorRoom", userInfo.id);
      } else if (userInfo.roleId === USER_ROLE.ADMIN) {
        this.socket.emit("leaveAdminRoom", userInfo.id);
      } else if (userInfo.roleId === USER_ROLE.CUSTOMER) {
        this.socket.emit("leaveCustomerRoom", userInfo.id);
      } else if (userInfo.roleId === USER_ROLE.LEADER) {
        this.socket.emit("leaveLeaderRoom", userInfo.id);
      }
      this.socket.disconnect();
    }
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
      default:
        return "";
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
        // Tải lại danh sách thông báo để đồng bộ với database
        await this.loadNotifications();
      }
      this.props.history.push(url);
    } catch (e) {
      console.log("Lỗi khi đánh dấu thông báo đã đọc:", e);
    }
  };

  handleMarkAllAsRead = async () => {
    const { notifications } = this.state;
    try {
      await Promise.all(
        notifications.filter((n) => !n.isRead).map((n) => markAsRead(n.id))
      );

      this.setState((prevState) => ({
        notifications: prevState.notifications.map((n) => ({
          ...n,
          isRead: true,
        })),
      }));

      message.success("Tất cả thông báo đã được đánh dấu là đã đọc!");
    } catch (e) {
      console.log("Lỗi khi đánh dấu tất cả đã đọc:", e);
      message.error("Không thể đánh dấu tất cả thông báo!");
    }
  };

  render() {
    const { processLogout, language, userInfo } = this.props;
    const { notifications } = this.state;

    const renderNotificationItem = (item) => {
      let icon, color;

      if (item.message.includes("xác nhận")) {
        icon = <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      } else if (
        item.message.includes("hủy") ||
        item.message.includes("bị huỷ")
      ) {
        icon = <CloseCircleOutlined style={{ color: "#f5222d" }} />;
      } else {
        icon = <ClockCircleOutlined style={{ color: "#faad14" }} />;
      }

      return (
        <div
          onClick={() => this.handleNotificationClick(item.url, item.id)}
          className={`notif-item ${item.isRead ? "read" : "unread"}`}
        >
          <div className="notif-icon">{icon}</div>
          <div className="notif-content">
            <div className="notif-text">{item.message}</div>
            <div className="notif-time">{moment(item.createdAt).fromNow()}</div>
          </div>
          {!item.isRead && <span className="notif-dot"></span>}
        </div>
      );
    };

    const notificationOverlay = (
      <div className="custom-notif-dropdown">
        <div className="notif-container">
          {/* Header cố định */}
          <div className="notif-header">
            <span>Thông báo</span>
          </div>

          {/* Danh sách cuộn */}
          <div className="notif-list">
            {notifications.length > 0 ? (
              notifications.map((item) => renderNotificationItem(item))
            ) : (
              <div className="text-center p-3 text-muted">
                Không có thông báo
              </div>
            )}
          </div>

          {/* Footer: Đánh dấu tất cả (có điều kiện) */}
          {notifications.some((n) => !n.isRead) && (
            <div
              className="notif-footer"
              onClick={this.handleMarkAllAsRead}
              style={{ cursor: "pointer" }}
            >
              Đánh dấu tất cả là đã đọc
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="header">
        <div className="logo-header"></div>

        <div className="languages">
          {/* Icon thông báo */}
          <Dropdown
            menu={{ items: [] }}
            popupRender={() => notificationOverlay}
            trigger={["click"]}
            placement="bottomRight"
            overlayClassName="custom-notif-overlay"
          >
            <Badge
              count={notifications.filter((notif) => !notif.isRead).length}
              offset={[-25, 0]}
            >
              <BellOutlined
                className={
                  notifications.some((notif) => !notif.isRead)
                    ? "bell-icon bell-animate"
                    : "bell-icon"
                }
                style={{
                  fontSize: "25px",
                  cursor: "pointer",
                  marginRight: 20,
                  color: "navy",
                }}
              />
            </Badge>
          </Dropdown>
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
                  {userInfo?.fullName || ""}
                </span>
              </span>
              <span className={`role-badge mt-1 ${userInfo.roleId}`}>
                <CrownTwoTone className="me-1" />
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
          <LogoutOutlined style={{ fontSize: "20px" }} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    processLogout: () => dispatch(actions.processLogout()),
    changeLanguageAppRedux: (language) => dispatch(changeLanguageApp(language)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
