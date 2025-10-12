import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter as Router } from "connected-react-router";
import { history } from "../redux";
import { ToastContainer } from "react-toastify";
import {
  userIsAuthenticated,
  userIsNotAuthenticated,
  userIsAdminOrDoctor,
  userIsLeaderHospital,
} from "../hoc/authentication";
import { path } from "../utils";
import Home from "../routes/Home";
import System from "../routes/System";
import Doctor from "../routes/Doctor.js";
import LeaderHospital from "../routes/LeaderHospital.js";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import HomePage from "./HomePage/HomePage.js";
import DetailDoctor from "./Patient/Doctor/DetailDoctor.js";
import DetailSpecialty from "./Patient/Specialty/DetailSpecialty.js";
import DetailHospital from "./Patient/Hospital/DetailHospital.js";
import ListSpecialty from "./Patient/Specialty/ListSpecialty.js";
import ListHospital from "./Patient/Hospital/ListHospital.js";
import ListDoctor from "./Patient/Doctor/ListDoctor.js";
import NewAppointment from "./Patient/AppointmentSchedule/NewAppointment.js";
import DoneAppointment from "./Patient/AppointmentSchedule/DoneAppointment.js";
import ProfileComponent from "./Patient/ProfileComponent/index.js";

import { CustomToastCloseButton } from "../components/CustomToast";
import CustomScrollbars from "../components/CustomScrollbars.js";
import GlobalLoading from "../components/GlobalLoading.js";
import VerifyEmail from "./Patient/VerifyEmail.js";

class App extends Component {
  render() {
    return (
      <Fragment>
        <GlobalLoading />
        <Router history={history}>
          <div className="main-container">
            <div className="content-container">
              <CustomScrollbars style={{ height: "100vh", width: "100%" }}>
                <Switch>
                  <Route path={path.HOME} exact component={Home} />
                  <Route
                    path={path.LOGIN}
                    component={userIsNotAuthenticated(Login)}
                  />
                  <Route path={path.REGISTER} component={Register} />
                  <Route
                    path={path.SYSTEM}
                    component={userIsAdminOrDoctor(System)}
                  />
                  <Route
                    path={"/doctor/"}
                    component={userIsAdminOrDoctor(Doctor)}
                  />
                  <Route
                    path={"/leader-hospital/"}
                    component={userIsLeaderHospital(LeaderHospital)}
                  />
                  <Route path={path.HOMEPAGE} component={HomePage} />

                  <Route path={path.DETAIL_DOCTOR} component={DetailDoctor} />
                  <Route
                    path={path.DETAIL_SPECIALTY}
                    component={DetailSpecialty}
                  />
                  <Route
                    path={path.DETAIL_HOSPITAL}
                    component={DetailHospital}
                  />
                  <Route
                    path={path.VERIFY_EMAIL_BOOKING}
                    component={VerifyEmail}
                  />

                  <Route path={path.LIST_SPECIALTY} component={ListSpecialty} />
                  <Route path={path.LIST_HOSPITAL} component={ListHospital} />
                  <Route path={path.LIST_DOCTOR} component={ListDoctor} />

                  <Route
                    path={path.NEW_APPOINTMENT}
                    component={NewAppointment}
                  />
                  <Route
                    path={path.DONE_APPOINTMENT}
                    component={DoneAppointment}
                  />

                  <Route
                    path={path.PROFILE_USER}
                    component={ProfileComponent}
                  />
                </Switch>
              </CustomScrollbars>
            </div>

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    started: state.app.started,
    isLoggedIn: state.user.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
