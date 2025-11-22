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
  BellFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  CalendarOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Dropdown, Badge, message, Drawer, Avatar, Menu } from "antd";
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
      isMobile: window.innerWidth < 992,
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  // ==== Các hàm xử lý Drawer ====
  toggleMenu = () => {
    this.setState((prev) => ({ mobileMenu: !prev.mobileMenu }));
  };

  handleNavigate = (path) => {
    this.props.history.push(path);
    this.setState({ mobileMenu: false });
  };

  handleProfileTab = (tab) => {
    const { userInfo } = this.props;
    if (userInfo?.id) {
      this.props.history.push(`/profile-user/${userInfo.id}?tab=${tab}`);
      this.setState({ mobileMenu: false });
    }
  };

  handleLogout = () => {
    this.props.processLogout();
    this.props.history.push("/home");
    this.setState({ mobileMenu: false });
  };

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

  handleResize = () => {
    this.setState({ isMobile: window.innerWidth < 992 });
  };

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
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
    window.removeEventListener("resize", this.handleResize);
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

  render() {
    const { mobileMenu, notifications, isMobile, keyword } = this.state;
    const { language, isLoggedIn, userInfo, location, intl } = this.props;
    const currentPath = location.pathname;
    const placeholderText = intl.formatMessage({ id: "banner.placeholder" });

    let activeMainMenu = "";
    if (currentPath === "/home") activeMainMenu = "/home";
    else if (currentPath === "/list-specialty")
      activeMainMenu = "/list-specialty";
    else if (currentPath === "/list-hospital")
      activeMainMenu = "/list-hospital";
    else if (currentPath === "/list-doctor") activeMainMenu = "/list-doctor";
    else if (currentPath === "/schedule-appointment")
      activeMainMenu = "/schedule-appointment";

    const isProfilePage = location.pathname.includes("/profile-user/");
    const query = new URLSearchParams(location.search);
    const currentTab = isProfilePage ? query.get("tab") || "info" : "";

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
        onClick: this.props.handleLogout,
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
          key={item.id}
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
          {/* HEADER: Chỉ tiêu đề */}
          <div className="notif-header">
            <span>{language === "vi" ? "Thông báo" : "Notification"}</span>
          </div>

          {/* DANH SÁCH CUỘN */}
          <div className="notif-list">
            {notifications.length > 0 ? (
              notifications.map((item) => renderNotificationItem(item))
            ) : (
              <div className="text-center p-3 text-muted">
                {language === "vi"
                  ? "Không có thông báo nào"
                  : "No announcements"}
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
              {language === "vi"
                ? "Đánh dấu tất cả là đã đọc"
                : "Mark all as read"}
            </div>
          )}
        </div>
      </div>
    );

    // Drawer Menu Mobile
    const drawerMenu = (
      <div
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            textAlign: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div
            className="header-logo"
            style={{
              height: 50,
              background: `url(${require("../../assets/careFlow_logo.png")}) center/contain no-repeat`,
              marginBottom: 16,
            }}
            onClick={() => this.handleNavigate("/home")}
          />
          {isLoggedIn && userInfo && (
            <>
              <Avatar
                size={64}
                src={
                  userInfo.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
              />
              <div style={{ marginTop: 8, fontWeight: "bold", fontSize: 16 }}>
                {userInfo.fullName || "Người dùng"}
              </div>
            </>
          )}
        </div>

        {/* Menu Chính */}
        <Menu
          mode="inline"
          selectedKeys={[activeMainMenu]}
          style={{ borderRight: 0, flex: 1 }}
        >
          {[
            {
              icon: <HomeOutlined />,
              label: <FormattedMessage id="homeheader.home" />,
              path: "/home",
            },
            {
              icon: <MedicineBoxOutlined />,
              label: <FormattedMessage id="homeheader.speciality" />,
              path: "/list-specialty",
            },
            {
              icon: <HomeOutlined />,
              label: <FormattedMessage id="homeheader.health-facility" />,
              path: "/list-hospital",
            },
            {
              icon: <TeamOutlined />,
              label: <FormattedMessage id="homeheader.doctor" />,
              path: "/list-doctor",
            },
            {
              icon: <CalendarOutlined />,
              label: <FormattedMessage id="homeheader.package" />,
              path: "/schedule-appointment",
            },
          ].map((item) => (
            <Menu.Item
              key={item.path}
              icon={item.icon}
              onClick={() => this.handleNavigate(item.path)}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu>

        {/* Menu Tài khoản */}
        {isLoggedIn && userInfo && (
          <>
            <div style={{ borderTop: "1px solid #f0f0f0" }} />
            <Menu
              mode="inline"
              selectedKeys={currentTab ? [currentTab] : []}
              style={{ borderRight: 0 }}
            >
              <Menu.Item
                key="info"
                icon={<UserOutlined />}
                onClick={() => this.handleProfileTab("info")}
              >
                {language === "vi" ? "Hồ sơ cá nhân" : "Personal profile"}
              </Menu.Item>
              <Menu.Item
                key="favorites"
                icon={<HeartOutlined />}
                onClick={() => this.handleProfileTab("favorites")}
              >
                {language === "vi" ? "Danh sách yêu thích" : "Favorites list"}
              </Menu.Item>
              <Menu.Item
                key="changePassword"
                icon={<LockOutlined />}
                onClick={() => this.handleProfileTab("changePassword")}
              >
                {language === "vi" ? "Đổi mật khẩu" : "Change password"}
              </Menu.Item>
              <Menu.Item
                key="logout"
                icon={<LogoutOutlined />}
                onClick={this.handleLogout}
                style={{ color: "#ff4d4f" }}
              >
                {language === "vi" ? "Đăng xuất" : "Logout"}
              </Menu.Item>
            </Menu>
          </>
        )}

        <div
          style={{
            padding: 16,
            borderTop: "1px solid #f0f0f0",
            textAlign: "center",
          }}
        >
          <span
            className={`mx-3 cursor-pointer ${
              language === LANGUAGES.VI ? "fw-bold text-danger" : ""
            }`}
            onClick={() => this.changeLanguage(LANGUAGES.VI)}
          >
            VN
          </span>
          <span
            className={`mx-3 cursor-pointer ${
              language === LANGUAGES.EN ? "fw-bold text-primary" : ""
            }`}
            onClick={() => this.changeLanguage(LANGUAGES.EN)}
          >
            EN
          </span>
        </div>
      </div>
    );

    // Banner
    const desktopBanners = [
      require("../../assets/images/banner2.png"),
      require("../../assets/images/homepage_banner.jpg"),
      require("../../assets/images/banner3.png"),
    ];
    const mobileBanners = [
      require("../../assets/images/bannerPhone1.png"),
      require("../../assets/images/bannerPhone2.png"),
      require("../../assets/images/bannerPhone3.png"),
    ];
    const banners = isMobile ? mobileBanners : desktopBanners;

    return (
      <React.Fragment>
        {/* HEADER */}
        <div className="home-header-container">
          <div className="home-header-content gap-3">
            <div className="left-content">
              <i
                className="fas fa-bars menu-icon"
                onClick={this.toggleMenu}
              ></i>
              <div className="header-logo" onClick={this.returnToHome}></div>
            </div>

            {/* Menu ngang (desktop + tablet) */}
            <div
              className={`center-content text-uppercase ${
                !mobileMenu && isMobile ? "hide-mobile-menu" : ""
              }`}
            >
              <div
                className={`child-content ${
                  currentPath === "/home" ? "active" : ""
                }`}
                onClick={() => this.handleNavigate("/home")}
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
                onClick={() => this.handleNavigate("/list-specialty")}
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
                onClick={() => this.handleNavigate("/list-hospital")}
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
                onClick={() => this.handleNavigate("/list-doctor")}
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
                onClick={() => this.handleNavigate("/schedule-appointment")}
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

            {/* Right content */}
            <div className="right-content">
              {isLoggedIn && (
                <div className="notification-wrapper me-3">
                  <Dropdown
                    menu={{ items: [] }}
                    popupRender={() => notificationOverlay}
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
                      <BellFilled
                        className={
                          notifications.some((n) => !n.isRead)
                            ? "bell-icon bell-animate"
                            : "bell-icon"
                        }
                        style={{
                          fontSize: 25,
                          cursor: "pointer",
                          marginRight: 10,
                          color: "#ffa70c",
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
                      {userInfo?.fullName}
                    </strong>
                  </span>
                  <img
                    className="avatar object-fit-cover rounded-circle border border-2 border-primary"
                    alt="avatar"
                    src={
                      userInfo?.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                  />
                  {/* sub-menu */}
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

        {/* DRAWER MOBILE */}
        <Drawer
          placement="left"
          open={isMobile && mobileMenu}
          onClose={() => this.setState({ mobileMenu: false })}
          width={280}
          styles={{ body: { padding: 0 }, header: { display: "none" } }}
        >
          {drawerMenu}
        </Drawer>

        {/* Banner */}
        {this.props.isShowBanner && (
          <div className="home-header-banner">
            <Swiper
              modules={[Autoplay, Pagination]}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              loop
              pagination={{ clickable: true }}
              speed={900}
              className="banner-swiper"
              onSlideChange={(swiper) =>
                this.setState({ activeSlide: swiper.realIndex })
              }
            >
              {banners.map((banner, i) => (
                <SwiperSlide key={i}>
                  <div
                    className="banner-slide"
                    style={{ backgroundImage: `url(${banner})` }}
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
                  value={keyword}
                  onChange={(e) => this.setState({ keyword: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && this.handleSearch()}
                />
              </div>
            </div>

            <div className="content-down d-none d-md-block">
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
