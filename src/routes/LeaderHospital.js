import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import Header from "../containers/Header/Header";
import ManageSchedule from "../containers/System/Doctor/ManageSchedule";
import ManagePatient from "../containers/System/Doctor/ManagePatient";
import WaitingApproval from "../containers/System/Doctor/WaitingApproval";
import ProfileUser from "../containers/System/Doctor/ProfileUser";
import ChangePassword from "../components/ChangePassword";
import LeaderHospitalDashboard from "../containers/System/LeaderHospital/LeaderHospitalDashboard";
import Navigator from "../components/Navigator";
import { leaderHospitalMenu } from "../containers/Header/menuApp";
import EditHospital from "../containers/System/Hospital/EditHospital";
import ManageDoctor from "../containers/System/Admin/ManageDoctor";
import CalendarSchedule from "../components/CalendarSchedule";
import ViewAppointment from "../containers/Patient/AppointmentSchedule/ViewAppointment";

class LeaderHospital extends Component {
  render() {
    const { systemMenuPath, isLoggedIn, userInfo } = this.props;

    const leaderHospitalMenus = leaderHospitalMenu.map((group) => ({
      ...group,
      menus: group.menus.map((item) => {
        if (item.link.includes(":id")) {
          return {
            ...item,
            link: item.link.replace(":id", userInfo?.id || ""),
          };
        }
        if (item.link.includes(":hospitalId")) {
          return {
            ...item,
            link: item.link.replace(":hospitalId", userInfo?.hospitalId || ""),
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
              <Navigator menus={leaderHospitalMenus} />
            </div>
          </div>
          <div className="system-container">
            <div className="system-list">
              <Switch>
                <Route
                  path="/leader-hospital/dashboard"
                  component={LeaderHospitalDashboard}
                />
                <Route
                  path="/leader-hospital/profile-user/:id"
                  component={ProfileUser}
                />
                <Route
                  path="/leader-hospital/change-password/:id"
                  component={ChangePassword}
                />
                <Route
                  path="/leader-hospital/manage-schedule"
                  component={ManageSchedule}
                />
                <Route
                  path="/leader-hospital/waiting-approval"
                  component={WaitingApproval}
                />
                <Route
                  path="/leader-hospital/manage-hospital/:hospitalId"
                  component={EditHospital}
                />
                <Route
                  path="/leader-hospital/manage-doctor"
                  component={ManageDoctor}
                />
                <Route
                  path="/leader-hospital/manage-patient"
                  component={ManagePatient}
                />
                <Route
                  path="/leader-hospital/schedule"
                  component={CalendarSchedule}
                />
                <Route
                  path="/leader-hospital/view-appointment/:bookingId"
                  component={ViewAppointment}
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

export default connect(mapStateToProps)(LeaderHospital);
