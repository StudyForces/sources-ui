import React, {StrictMode} from 'react'
import {ReactKeycloakProvider} from '@react-keycloak/web'
import Keycloak from 'keycloak-js'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import {config} from './Constants'
import PrivateRoute from "./components/misc/PrivateRoute";
import Home from "./components/home/Home";
import Header from "./components/misc/Header";

function App() {
    const keycloak = new Keycloak({
        url: `${config.url.KEYCLOAK_BASE_URL}`,
        realm: "StudyForces",
        clientId: "sources-ui"
    })
    const initOptions = {
        pkceMethod: 'S256',
        checkLoginIframe: true,
        onLoad: 'check-sso'
    }

    const handleOnEvent = async (event, error) => {
        if (event === 'onAuthSuccess') {
            if (keycloak.authenticated) {
                // sth
            }
        }
    }

    const loadingComponent = (
        <p>Keycloak is loading or running authorization code flow with PKCE.</p>
    );

    return (
        <ReactKeycloakProvider
            authClient={keycloak}
            initOptions={initOptions}
            LoadingComponent={loadingComponent}
            onEvent={(event, error) => handleOnEvent(event, error)}
        >
            <StrictMode>
                <Router>
                    <Header></Header>
                    <Switch>
                        <Route path='/' exact component={Home}/>
                        <Route path='/home' component={Home}/>
                        <PrivateRoute path='/uploads' component={Home}/>
                        <Route component={Home}/>
                    </Switch>
                </Router>
            </StrictMode>
        </ReactKeycloakProvider>
    );
}

export default App;
