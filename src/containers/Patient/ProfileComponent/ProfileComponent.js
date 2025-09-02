import React from "react";
import { Layout, Menu, Avatar } from "antd";
import { UserOutlined, LockOutlined, LogoutOutlined } from "@ant-design/icons";
import HomeHeader from "../../HomePage/HomeHeader";
import HomeFooter from "../../HomePage/HomeFooter";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../../../store/actions";
import { useHistory } from "react-router-dom";

const { Sider, Content } = Layout;

const ProfileComponent = () => {
  const userInfo = useSelector((state) => state.user.userInfo);
  const dispatch = useDispatch();
  const history = useHistory();

  const handleLogout = () => {
    dispatch(actions.processLogout());
    history.push("/home");
  };

  const sideBarTabs = [
    {
      key: "info",
      label: "Hồ sơ cá nhân",
      path: `profile-user/${userInfo.id}?tab=info`,
      icon: <UserOutlined />,
    },
    {
      key: "changePassword",
      label: "Đổi mật khẩu",
      path: `profile-user/${userInfo.id}?tab=changePassword`,
      icon: <LockOutlined />,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: handleLogout,
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <div className="profile-container bg-light">
      <HomeHeader />
      <Layout
        className="profile-body"
        style={{
          minHeight: "100vh",
          paddingTop: "8%",
          margin: "0 10%",
          background: "none",
        }}
      >
        <Layout className="gap-3" style={{ background: "none" }}>
          {/* Sidebar */}
          <Sider
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
              <div className="mt-2 fw-bold">
                {userInfo?.fullName || "Người dùng"}
              </div>
            </div>

            <Menu theme="dark" mode="inline" defaultSelectedKeys={["info"]}>
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
            className="shadow rounded-3"
            style={{ padding: "24px", background: "#fff" }}
          >
            <Content className="profile-content">
              <h2>Chào, {userInfo.fullName}</h2>
              <p>Chọn một tab từ sidebar.</p>
            </Content>
          </Layout>
        </Layout>
      </Layout>
      <HomeFooter />
    </div>
  );
};

export default ProfileComponent;
