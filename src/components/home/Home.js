import React, { Component } from 'react';
import {Container, Alert} from "react-bootstrap";

class Home extends Component {
    render() {
        return (
            <Container className="mt-3">
                <h1>Home</h1>
                <Alert variant="primary">
                    Hey, there will be something soon!
                </Alert>
            </Container>
        );
    }
}

export default Home;
