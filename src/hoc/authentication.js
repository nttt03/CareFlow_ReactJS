import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";
import { path } from "../utils";

const locationHelper = locationHelperBuilder({});

export const userIsAuthenticated = connectedRouterRedirect({
    authenticatedSelector: state => state.user.isLoggedIn,
    wrapperDisplayName: 'UserIsAuthenticated',
    redirectPath: '/login'
});

export const userIsNotAuthenticated = connectedRouterRedirect({
    // Want to redirect the user when they are authenticated
    authenticatedSelector: state => !state.user.isLoggedIn,
    wrapperDisplayName: 'UserIsNotAuthenticated',
    redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/',
    allowRedirectBack: false
});

export const userIsAdminOrDoctor = connectedRouterRedirect({
    authenticatedSelector: state => {
        const isLoggedIn = state.user.isLoggedIn;
        const roleId = state.user.userInfo?.roleId;
        return isLoggedIn && (roleId === 'R1' || roleId === 'R2');
    },
    wrapperDisplayName: 'UserIsAdminOrDoctor',
    redirectPath: path.HOME,
});
