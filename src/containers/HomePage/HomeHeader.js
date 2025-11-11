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
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Dropdown, Badge, message } from "antd";
import { getNotifications, markAsRead } from "../../services/userService";
import { io } from "socket.io-client";
import StatsSection from "../../components/StatsSection";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Review from "../../components/Review";
import "swiper/css";
import "swiper/css/pagination";
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

const bannerImages = [
  require("../../assets/images/banner2.png"),
  require("../../assets/images/homepage_banner.jpg"),
  require("../../assets/images/banner3.png"),
];

class HomeHeader extends Component {
  socket = null;
  constructor(props) {
    super(props);
    this.state = {
      mobileMenu: false,
      notifications: [],
      activeSlide: 0,
      keyword: "",
      reviewSocketBooking: null,
      notifDropdownOpen: false,
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }
  openReviewModal = (socketBooking = null) => {
    this.setState({
      reviewModalVisible: true,
      reviewSocketBooking: socketBooking,
    });
  };

  closeReviewModal = () => {
    this.setState({
      reviewModalVisible: false,
      reviewSocketBooking: null,
    });
  };

  setNotifDropdownOpen = (open) => {
    this.setState({ notifDropdownOpen: open });
  };
  handleSearch = () => {
    const { keyword } = this.state;
    if (!keyword.trim()) return;

    this.props.history.push(`/search?keyword=${encodeURIComponent(keyword)}`);
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

  handleMarkAllAsRead = async () => {
    const { notifications } = this.state;
    try {
      // lặp từng cái gọi markAsRead()
      await Promise.all(
        notifications.filter((n) => !n.isRead).map((n) => markAsRead(n.id))
      );

      // Cập nhật lại state
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
        // Nếu notification có URL /review → gọi callback HomePage
        if (data.url === "/review" && this.props.onReviewNotification) {
          this.props.onReviewNotification(data.booking || null);
        }
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

      if (url === "/review") {
        this.openReviewModal();
        this.setState({ notifDropdownOpen: false });
      } else {
        this.props.history.push(url);
        this.setState({ notifDropdownOpen: false });
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
      this.props.history.push(`/schedule-appointment`);
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
    const { notifications } = this.state;
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
        label: language === "vi" ? "Hồ sơ cá nhân" : "Personal profile",
        path: null,
        icon: <UserOutlined />,
      },
      {
        key: "favorites",
        label: language === "vi" ? "Danh sách yêu thích" : "Favorites list",
        path: null,
        icon: <UserOutlined />,
      },
      {
        key: "changePassword",
        label: language === "vi" ? "Đổi mật khẩu" : "Change password",
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
        label: language === "vi" ? "Đăng xuất" : "Logout",
        onClick: handleLogout,
        icon: <LogoutOutlined />,
      });
    }
    const renderNotificationItem = (item) => {
      let icon;
      if (item.message.includes("xác nhận")) {
        icon = <CheckCircleOutlined style={{ color: "#0775d5" }} />;
      } else if (item.message.includes("hoàn thành")) {
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
          key={item.id}
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
          {/* HEADER: Chỉ tiêu đề */}
          <div className="notif-header">
            <span>Thông báo</span>
          </div>

          {/* DANH SÁCH CUỘN */}
          <div className="notif-list">
            {notifications.length > 0 ? (
              notifications.map((item) => renderNotificationItem(item))
            ) : (
              <div className="text-center p-3 text-muted">
                Không có thông báo nào
              </div>
            )}
          </div>

          {/* FOOTER: Nút đánh dấu tất cả */}
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
                  currentPath === "/schedule-appointment" ? "active" : ""
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
              {isLoggedIn && (
                <div className="notification-wrapper me-3">
                  <Dropdown
                    overlay={notificationOverlay}
                    trigger={["click"]}
                    placement="bottomRight"
                    overlayClassName="custom-notif-overlay"
                    open={this.state.notifDropdownOpen}
                    onOpenChange={(open) => this.setNotifDropdownOpen(open)}
                  >
                    <Badge
                      count={notifications.filter((n) => !n.isRead).length}
                      offset={[-16, -2]}
                    >
                      <BellOutlined
                        className={
                          notifications.some((n) => !n.isRead)
                            ? "bell-icon bell-animate"
                            : "bell-icon"
                        }
                        style={{
                          fontSize: "25px",
                          cursor: "pointer",
                          marginRight: 10,
                          color: "#2563eb",
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
            </div>
          </div>
        </div>
        {this.props.isShowBanner === true && (
          <div className="home-header-banner">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              loop={true}
              pagination={{ clickable: true }}
              speed={900}
              className="banner-swiper"
              onSlideChange={(swiper) =>
                this.setState({ activeSlide: swiper.realIndex })
              }
            >
              {bannerImages.map((img, i) => (
                <SwiperSlide key={i}>
                  <div
                    className="banner-slide"
                    style={{
                      backgroundImage: `url(${img})`,
                    }}
                  ></div>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="content-up">
              <div
                className={`title1 ${
                  this.state.activeSlide === 0 || this.state.activeSlide === 2
                    ? "text-white"
                    : ""
                }`}
              >
                <FormattedMessage id="banner.title1" />
              </div>

              <div
                className={`title2 ${
                  this.state.activeSlide === 0 || this.state.activeSlide === 2
                    ? "text-white"
                    : ""
                }`}
              >
                <FormattedMessage id="banner.title2" />
              </div>
              <div className="search">
                <i
                  className="fas fa-search"
                  onClick={this.handleSearch}
                  style={{ cursor: "pointer" }}
                ></i>
                <input
                  type="text"
                  placeholder={placeholderText}
                  value={this.state.keyword}
                  onChange={(e) => this.setState({ keyword: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && this.handleSearch()}
                />
              </div>
            </div>

            <div className="content-down">
              <StatsSection />
            </div>
          </div>
        )}
        <Review
          visible={this.state.reviewModalVisible}
          onClose={this.closeReviewModal}
          userId={userInfo?.id}
          socketBooking={this.state.reviewSocketBooking}
        />
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
