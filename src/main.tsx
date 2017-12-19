import "core-js";
import {
  getMuiTheme,
  lightBaseTheme,
  MuiThemeProvider,
} from "material-ui/styles";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { App } from "./components";

ReactDOM.render(
  <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
    <App />
  </MuiThemeProvider>,
  document.querySelector("#root"),
);
