"use strict";

import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {AppBox} from "./components/App";
import {id, Login, roomid} from "./components/Login";
import "./index.css";

const PrivateRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={props =>
        id && roomid ? <Component {...props}/> : <Redirect push to='/'/>
    }/>
);

function App() {
    return (
        <BrowserRouter>
            <Switch>
                <PrivateRoute exact path="/r/:room" component={AppBox}/>
                <Route path="*" component={Login}/>
            </Switch>
        </BrowserRouter>
    )
}

ReactDOM.render(<App/>, document.getElementById("root"));