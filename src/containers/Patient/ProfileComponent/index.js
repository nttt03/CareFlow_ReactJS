import React from "react";
import { Layout, Menu, Avatar, Empty } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import Profile from "./components/Profile";
import ChangePassword from "../../../components/ChangePassword";
import Favorites from "./components/Favorites";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../../../store/actions";
import { useHistory, useLocation } from "react-router-dom";
import bg from "../../../assets/background.png";
import { showLoading, hideLoading } from "../../../store/actions";

const { Sider, Content } = Layout;

const ProfileComponent = () => {
  const userInfo = useSelector((state) => state.user.userInfo);
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get("tab") || "info";
  const language = useSelector((state) => state.app.language);

  if (!userInfo) {
    dispatch(showLoading());
    return <Empty />;
  }
  dispatch(hideLoading());

  const handleLogout = () => {
    dispatch(actions.processLogout());
    history.push("/home");
  };

  const sideBarTabs = [
    {
      key: "info",
      label: language === "vi" ? "Hồ sơ cá nhân" : "Personal profile",
      path: `profile-user/${userInfo.id}?tab=info`,
      icon: <UserOutlined />,
    },
    {
      key: "favorites",
      label: language === "vi" ? "Danh sách yêu thích" : "Favorites list",
      path: `profile-user/${userInfo.id}?tab=favorites`,
      icon: <HeartOutlined />,
    },
    {
      key: "changePassword",
      label: language === "vi" ? "Đổi mật khẩu" : "Change password",
      path: `profile-user/${userInfo.id}?tab=changePassword`,
      icon: <LockOutlined />,
    },
    {
      key: "logout",
      label: language === "vi" ? "Đăng xuất" : "Logout",
      onClick: handleLogout,
      icon: <LogoutOutlined />,
    },
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case "info":
        return <Profile />;
      case "favorites":
        return <Favorites />;
      case "changePassword":
        return <ChangePassword />;
      default:
        return <Empty />;
    }
  };

  return (
    <div
      className="profile-container "
      style={{
        // backgroundImage: `url(${bg})`,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <HomeHeader />
      <Layout
        className="profile-body"
        style={{
          minHeight: "100vh",
          paddingTop: window.innerWidth < 970 ? "12%" : "7%",
          margin: "0 10%",
          background: "none",
        }}
      >
        <Layout className="gap-3" style={{ background: "none" }}>
          {/* Sidebar */}
          <Sider
            theme="light"
            className="rounded-3"
            breakpoint="lg"
            collapsedWidth="0"
            style={{
              height: "100%",
            }}
          >
            <div className="d-flex flex-column align-items-center p-3 text-white">
              <Avatar
                size={60}
                src={
                  userInfo?.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                className="border border-2 border-primary rounded-circle"
              />
              <div className="mt-2 fw-bold text-primary">
                {userInfo?.fullName || "Người dùng"}
              </div>
            </div>

            <Menu theme="light" mode="inline" selectedKeys={[currentTab]}>
              {sideBarTabs.map((tab) => (
                <Menu.Item
                  key={tab.key}
                  icon={tab.icon}
                  onClick={() =>
                    tab.onClick ? tab.onClick() : history.push(`/${tab.path}`)
                  }
                >
                  {tab.label}
                </Menu.Item>
              ))}
            </Menu>
          </Sider>

          {/* Nội dung chính */}
          <Layout
            className="shadow-sm rounded-3 mb-5"
            style={{ padding: "1% 4%", background: "#fff" }}
          >
            <Content className="profile-content">{renderTabContent()}</Content>
          </Layout>
        </Layout>
      </Layout>
      <HomeFooter />
    </div>
  );
};

export default ProfileComponent;
