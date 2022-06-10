import React, {StrictMode} from 'react'
import {ReactKeycloakProvider} from '@react-keycloak/web'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import keycloak from './keycloak';
import PrivateRoute from "./components/misc/PrivateRoute";
import Home from "./components/home/Home";
import Header from "./components/misc/Header";
import UploadsPage from "./components/uploads/UploadsPage";
import UploadEditPage from "./components/upload-edit/UploadEditPage";

function App() {
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
                        <PrivateRoute path='/uploads' exact component={UploadsPage}/>
                        <PrivateRoute path='/uploads/:id' exact component={UploadEditPage}/>
                        <Route component={Home}/>
                    </Switch>
                </Router>
            </StrictMode>
        </ReactKeycloakProvider>
    );
}

export default App;
