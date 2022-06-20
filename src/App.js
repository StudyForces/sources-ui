import React, {StrictMode, useState} from 'react'
import {ReactKeycloakProvider} from '@react-keycloak/web'
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom'
import keycloak from './keycloak';
import PrivateRoute from "./components/misc/PrivateRoute";
import Home from "./components/home/Home";
import Header from "./components/misc/Header";
import UploadsPage from "./components/uploads/UploadsPage";
import UploadEditPage from "./components/upload-edit/UploadEditPage";
import OCRReviewPage from "./components/ocr-review/OCRReviewPage";
import {Alert, Container} from "react-bootstrap";

function App() {
    const [accessAllowed, setAccessAllowed] = useState(false);

    const initOptions = {
        pkceMethod: 'S256',
        checkLoginIframe: true,
        onLoad: 'check-sso'
    }

    const handleOnEvent = async (event, error) => {
        if (event === 'onAuthSuccess') {
            if (keycloak.authenticated) {
                // sth
                setAccessAllowed(keycloak.realmAccess.roles.includes('editor'));
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
                    {
                        !accessAllowed ? <Container className="mt-3">
                            <Alert variant="danger">
                                You have read-only access to Sources Toolkit unless you have <code>editor</code> role!
                                <br />
                                Please contact <a href="mailto:pavel@pkasila.net">pavel@pkasila.net</a> for further
                                information.
                            </Alert>
                        </Container> : null
                    }
                    <Switch>
                        <Route path='/' exact component={Home}/>
                        <Route path='/home' component={Home}/>
                        <PrivateRoute path='/uploads' exact component={UploadsPage}/>
                        <PrivateRoute path='/uploads/:id' exact component={UploadEditPage}/>
                        <PrivateRoute path='/uploads/:id/review' exact component={OCRReviewPage}/>
                        <Route component={Home}/>
                    </Switch>
                </Router>
            </StrictMode>
        </ReactKeycloakProvider>
    );
}

export default App;
