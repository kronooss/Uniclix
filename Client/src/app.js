import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import userflow from 'userflow.js';
import configStore from "./store/configStore";
import AppRouter from "./routes/AppRouter";
import "normalize.css/normalize.css";
import "./styles/styles.scss";
import { login, logout } from "./actions/auth";
import setAuthorizationHeader from "./utils/setAuthorizationHeader";
import { setProfile, startSetProfile } from "./actions/profile";
import { setChannels, startSetChannels } from "./actions/channels";
import { setMiddleware } from "./actions/middleware";
import { startGeneral } from './actions/general';
import 'antd/dist/antd.css';
import { Helmet } from 'react-helmet';
import {
    googleAnalyticsGtagID,
    firstPromoterOriginURL,
    tidioUrl,
    userFlowToken
} from './config/api';

const store = configStore();
userflow.init(userFlowToken);

const Root = () => (
    <div>
        <Helmet>
            {/* <!-- Global site tag (gtag.js) - Google Analytics --> */}
            {
                googleAnalyticsGtagID ? (
                    <script
                        async
                        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsGtagID}`}
                    >
                    </script>
                ) : null
            }
            {
                googleAnalyticsGtagID ? (
                    <script>
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());

                            gtag('config', '${googleAnalyticsGtagID}');
                        `}
                    </script>
                ) : null
            }
            {
                firstPromoterOriginURL ? (
                    <script type="text/javascript">
                        {`
                            (function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src='https://cdn.firstpromoter.com/fprom.js',t.onload=t.onreadystatechange=function(){var t=this.readyState;if(!t||"complete"==t||"loaded"==t)try{$FPROM.init("qtjnideb","${firstPromoterOriginURL}")}catch(t){}};var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(t,e)})();
                        `}
                    </script>
                ) : null
            }
            {
                tidioUrl ? <script src={`${tidioUrl}`} async></script> : null
            }
        </Helmet>
        <Provider store={store}>
            <AppRouter />
        </Provider>    
    </div>
);


let hasRendered = false;

const renderApp = () => {
    if(!hasRendered){
        ReactDOM.render(<Root />, document.getElementById("app"));
        hasRendered = true;
    }
};


const setAuthentication = () => {
    let token = localStorage.getItem("token") || undefined;

    token = token == "undefined" || typeof(token) === "undefined" ? undefined : token;

    store.dispatch(login(token));
    store.dispatch(setMiddleware("loading"));
    setAuthorizationHeader(token);

    if(token && token !== "undefined"){
        let channels;
        let profile;

        try {
            let channels = localStorage.getItem("channels");
            channels = channels ? JSON.parse(channels) : [];
        } catch (error) {
            channels = [];
        }

        try {
            profile = localStorage.getItem("profile");
            profile = profile ? JSON.parse(profile) : "";
        } catch (error) {
            profile = "";
        }

        if(!profile){
            localStorage.setItem("token", undefined);
            store.dispatch(logout());
            setAuthorizationHeader(undefined);
        }

        new Promise(function(resolve, reject) {
            store.dispatch(setProfile(profile));
            store.dispatch(setChannels(channels));
            return resolve(true);
        }).then(() => {
            store.dispatch(startSetProfile());
            store.dispatch(startSetChannels());
        }).then(() => {
            // store.dispatch(startGeneral());
        });
    }

    renderApp();
};

setAuthentication();
