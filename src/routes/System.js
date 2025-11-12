import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import UserManage from "../containers/System/UserManage";
import UserRedux from "../containers/System/Admin/UserRedux";
import Header from "../containers/Header/Header";
import { adminMenu, doctorMenu } from "../containers/Header/menuApp";
import Navigator from "../components/Navigator";
import "./System.scss";
import ManageDoctor from "../containers/System/Admin/ManageDoctor";
import ManageSpecialty from "../containers/System/Specialty/ManageSpecialty";
import ManageHospital from "../containers/System/Hospital/ManageHospital";
import AddHospital from "../containers/System/Hospital/AddHospital";
import EditHospital from "../containers/System/Hospital/EditHospital";
import AddSpecialty from "../containers/System/Specialty/AddSpecialty";
import EditSpecialty from "../containers/System/Specialty/EditSpecialty";
import ManageAccount from "../containers/System/Admin/ManageAccount";
import ManageSchedule from "../containers/System/Doctor/ManageSchedule";
import AdminDashboard from "../containers/System/Admin/AdminDashboard";
import ProfileUser from "../containers/System/Doctor/ProfileUser";
import ChangePassword from "../components/ChangePassword";
import MedicalRecord from "../containers/System/Doctor/MedicalRecord";
import ManagePatient from "../containers/System/Doctor/ManagePatient";
import WaitingApproval from "../containers/System/Doctor/WaitingApproval";
import CalendarSchedule from "../components/CalendarSchedule";

class System extends Component {
  render() {
    const { systemMenuPath, isLoggedIn, userInfo } = this.props;
    const adminMenus = adminMenu.map((group) => ({
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
              <Navigator menus={adminMenus} />
            </div>
          </div>
          <div className="system-container">
            <div className="system-list">
              <Switch>
                <Route path="/system/dashboard" component={AdminDashboard} />
                <Route
                  path="/system/profile-user/:id"
                  component={ProfileUser}
                />
                <Route
                  path="/system/change-password/:id"
                  component={ChangePassword}
                />
                <Route
                  path="/system/manage-account"
                  component={ManageAccount}
                />
                <Route path="/system/user-manage" component={UserManage} />
                <Route path="/system/user-redux" component={UserRedux} />
                <Route path="/system/manage-doctor" component={ManageDoctor} />
                <Route
                  path="/system/manage-schedule"
                  component={ManageSchedule}
                />
                <Route
                  path="/system/waiting-approval"
                  component={WaitingApproval}
                />
                <Route
                  path="/system/manage-patient"
                  component={ManagePatient}
                />
                <Route
                  path="/system/manage-medical-record"
                  component={MedicalRecord}
                />
                <Route
                  path="/system/manage-specialty/edit-specialty/:specialtyId"
                  component={EditSpecialty}
                />
                <Route
                  exact
                  path="/system/manage-specialty/add-specialty"
                  component={AddSpecialty}
                />
                <Route
                  exact
                  path="/system/manage-specialty"
                  component={ManageSpecialty}
                />
                <Route
                  path="/system/manage-hospital/add-hospital"
                  component={AddHospital}
                />
                <Route
                  path="/system/manage-hospital/edit-hospital/:hospitalId"
                  component={EditHospital}
                />
                <Route path="/system/schedule" component={CalendarSchedule} />

                <Route
                  exact
                  path="/system/manage-hospital"
                  component={ManageHospital}
                />

                <Route
                  component={() => {
                    return <Redirect to={systemMenuPath} />;
                  }}
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

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(System);
