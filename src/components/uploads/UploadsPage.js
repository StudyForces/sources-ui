import React, { Component } from 'react';
import {Container, Alert, Spinner, Pagination} from "react-bootstrap";
import {config} from '../../Constants';
import UploadsTable from "./UploadsTable";

class UploadsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: []
        };
    }

    componentDidMount() {
        fetch(`${config.url.API_BASE_URL}/sourceUploads?page=${0}&sort=id,desc`)
            .then(res => {
                if (!res.ok) {
                    throw Error(`${res.status} ${res.statusText}`);
                }
                return res;
            })
            .then(res => res.json())
            .then(res => {
                if (res.content.length === 1) {
                    if (res.content[0].value !== undefined) {
                        res.content = [];
                    }
                }
                return res;
            })
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result.content
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                        items: [],
                    });
                }
            )
    }

    table() {
        const { error, isLoaded, items } = this.state;
        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else if (items !== undefined) {
            return (
                <UploadsTable items={items}></UploadsTable>
            );
        } else {
            return <Alert variant="danger">WTF?</Alert>;
        }
    }

    render() {
        return (
            <Container className="mt-3">
                <h1>Uploads</h1>
                { this.table() }
            </Container>
        );
    }
}

export default UploadsPage;
