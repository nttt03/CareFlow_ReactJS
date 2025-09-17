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

class System extends Component {
  render() {
    const { systemMenuPath, isLoggedIn } = this.props;
    return (
      <Fragment>
        {isLoggedIn && <Header />}
        <div className="body-container">
          <div className="header-container">
            {/* thanh navigator */}
            <div className="header-tabs-container">
              <Navigator menus={adminMenu} />
            </div>
          </div>
          <div className="system-container">
            <div className="system-list">
              <Switch>
                <Route path="/system/user-manage" component={UserManage} />
                <Route path="/system/user-redux" component={UserRedux} />
                <Route path="/system/manage-doctor" component={ManageDoctor} />
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(System);
