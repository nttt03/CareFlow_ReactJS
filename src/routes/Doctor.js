import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Redirect, Route, Switch } from "react-router-dom";
import Header from "../containers/Header/Header";
import ManageSchedule from "../containers/System/Doctor/ManageSchedule";
import ManagePatient from "../containers/System/Doctor/ManagePatient";
import Navigator from "../components/Navigator";
import { doctorMenu } from "../containers/Header/menuApp";

class Doctor extends Component {
  render() {
    const { systemMenuPath, isLoggedIn } = this.props;
    return (
      <Fragment>
        {isLoggedIn && <Header />}
        <div className="body-container">
          <div className="header-container">
            {/* thanh navigator */}
            <div className="header-tabs-container">
              <Navigator menus={doctorMenu} />
            </div>
          </div>
          <div className="system-container">
            <div className="system-list">
              <Switch>
                <Route
                  path="/doctor/manage-schedule"
                  component={ManageSchedule}
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Doctor);
