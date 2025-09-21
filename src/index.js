import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "react-toastify/dist/ReactToastify.css";
import "./styles/styles.scss";
import "antd/dist/reset.css";

import App from "./containers/App";
import * as serviceWorker from "./serviceWorker";
import IntlProviderWrapper from "./hoc/IntlProviderWrapper";
import reduxStore, { persistor } from "./redux";
import GlobalLoading from "./components/GlobalLoading";

const renderApp = () => {
  ReactDOM.render(
    <Provider store={reduxStore}>
      <PersistGate loading={<GlobalLoading />} persistor={persistor}>
        <IntlProviderWrapper>
          <App />
        </IntlProviderWrapper>
      </PersistGate>
    </Provider>,
    document.getElementById("root")
  );
};

renderApp();
serviceWorker.unregister();
