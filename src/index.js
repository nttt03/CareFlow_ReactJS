import React from "react";
import ReactDOM from "react-dom";
import "react-toastify/dist/ReactToastify.css";
import "./styles/styles.scss";
import "antd/dist/reset.css";

import App from "./containers/App";
import * as serviceWorker from "./serviceWorker";
import IntlProviderWrapper from "./hoc/IntlProviderWrapper";

import { Provider } from "react-redux";
import reduxStore, { persistor } from "./redux";

// 👉 Fix ResizeObserver warning bằng override console.error
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0] &&
    typeof args[0].message === "string" &&
    args[0].message.includes(
      "ResizeObserver loop completed with undelivered notifications."
    )
  ) {
    // bỏ qua không log, không show overlay
    return;
  }
  originalError.apply(console, args);
};

const renderApp = () => {
  ReactDOM.render(
    <Provider store={reduxStore}>
      <IntlProviderWrapper>
        <App persistor={persistor} />
      </IntlProviderWrapper>
    </Provider>,
    document.getElementById("root")
  );
};

renderApp();
serviceWorker.unregister();
