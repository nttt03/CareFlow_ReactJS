import React, { useState, useEffect } from "react";
import { Layout, Avatar, Menu } from "antd";
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
import { handleLogoutApi } from "../../../services/userService";

const { Content } = Layout;

const ProfileComponent = () => {
  const userInfo = useSelector((state) => state.user.userInfo);
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const language = useSelector((state) => state.app.language);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get("tab") || "info";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!userInfo) {
      history.push("/home");
    }
  }, [userInfo, history]);

  const handleLogout = async () => {
    try {
      await handleLogoutApi();
      dispatch(actions.processLogout());
      history.push("/home");
    } catch (e) {
      console.log(e);
    }
  };

  const handleProfileTab = (tab) => {
    history.push(`/profile-user/${userInfo.id}?tab=${tab}`);
  };

  // Menu tài khoản cá nhân
  const profileMenuItems = [
    {
      key: "info",
      label: language === "vi" ? "Hồ sơ cá nhân" : "Personal profile",
      icon: <UserOutlined />,
    },
    {
      key: "favorites",
      label: language === "vi" ? "Danh sách yêu thích" : "Favorites list",
      icon: <HeartOutlined />,
    },
    {
      key: "changePassword",
      label: language === "vi" ? "Đổi mật khẩu" : "Change password",
      icon: <LockOutlined />,
    },
    {
      key: "logout",
      label: language === "vi" ? "Đăng xuất" : "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
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
        return <Profile />;
    }
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <HomeHeader />

      <Layout
        style={{
          margin: isMobile ? 0 : "0 7%",
          paddingTop: isMobile ? "12%" : "7%",
          minHeight: "100vh",
        }}
      >
        <Layout
          style={{
            background: "none",
            flexDirection: isMobile ? "column" : "row",
            gap: 24,
          }}
        >
          {/* Sidebar desktop */}
          {!isMobile && (
            <Layout.Sider
              width={280}
              theme="light"
              className="rounded-3 shadow-sm"
              style={{
                background: "#fff",
                marginBottom: isMobile ? 0 : 24,
                height: 300,
              }}
            >
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                <Avatar
                  size={80}
                  src={
                    userInfo?.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                />
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#0775d5",
                  }}
                >
                  {userInfo?.fullName}
                </div>
              </div>
              <Menu
                mode="inline"
                selectedKeys={[currentTab]}
                style={{ borderRight: 0 }}
              >
                {profileMenuItems.map((item) => (
                  <Menu.Item
                    key={item.key}
                    icon={item.icon}
                    onClick={() =>
                      item.onClick?.() || handleProfileTab(item.key)
                    }
                  >
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu>
            </Layout.Sider>
          )}

          {/* Nội dung chính */}
          <Layout
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              padding: isMobile ? 16 : 32,
              marginBottom: isMobile ? 0 : 24,
            }}
          >
            <Content>{renderTabContent()}</Content>
          </Layout>
        </Layout>
      </Layout>
      <HomeFooter />
    </div>
  );
};

export default ProfileComponent;
