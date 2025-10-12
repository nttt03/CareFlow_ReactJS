import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import Header from "../containers/Header/Header";
import ManageSchedule from "../containers/System/Doctor/ManageSchedule";
import ManagePatient from "../containers/System/Doctor/ManagePatient";
import WaitingApproval from "../containers/System/Doctor/WaitingApproval";
import ProfileUser from "../containers/System/Doctor/ProfileUser";
import ChangePassword from "../components/ChangePassword";
import DoctorDashboard from "../containers/System/Doctor/DoctorDashboard";
import Navigator from "../components/Navigator";
import { doctorMenu } from "../containers/Header/menuApp";

class Doctor extends Component {
  render() {
    const { systemMenuPath, isLoggedIn, userInfo } = this.props;

    const doctorMenus = doctorMenu.map((group) => ({
      ...group,
      menus: group.menus.map((item) => {
        if (item.link.includes(":id")) {
          return {
            ...item,
            link: item.link.replace(":id", userInfo?.id || ""),
          };
        }
        return item;
      }),
    }));

    return (
      <Fragment>
        {isLoggedIn && <Header history={this.props.history} />}
        <div className="body-container">
          <div className="header-container">
            {/* thanh navigator */}
            <div className="header-tabs-container">
              {/* ✅ Truyền menu đã có id thật */}
              <Navigator menus={doctorMenus} />
            </div>
          </div>
          <div className="system-container">
            <div className="system-list">
              <Switch>
                <Route path="/doctor/dashboard" component={DoctorDashboard} />
                <Route
                  path="/doctor/profile-user/:id"
                  component={ProfileUser}
                />
                <Route
                  path="/doctor/change-password/:id"
                  component={ChangePassword}
                />
                <Route
                  path="/doctor/manage-schedule"
                  component={ManageSchedule}
                />
                <Route
                  path="/doctor/waiting-approval"
                  component={WaitingApproval}
                />
                <Route
                  path="/doctor/manage-patient"
                  component={ManagePatient}
                />
              </Switch>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    systemMenuPath: state.app.systemMenuPath,
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
  };
};

export default connect(mapStateToProps)(Doctor);
