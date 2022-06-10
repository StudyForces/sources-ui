import React, { Component } from 'react';
import {Container, Alert, Spinner} from "react-bootstrap";
import {config} from '../../Constants';
import UploadsTable from "./UploadsTable";
import PaginationComponent from "../misc/PaginationComponent";

class UploadsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: [],
            currentPage: 0,
            page: {size: 20, totalElements: 0, totalPages: 0, number: 0},
        };
        this.loadPage = this.loadPage.bind(this);
        this.setPage = this.setPage.bind(this);
    }

    componentDidMount() {
        this.loadPage();
    }

    loadPage(page) {
        fetch(`${config.url.API_BASE_URL}/sourceUploads?page=${page ?? this.state.currentPage}&sort=id,desc&size=${this.state.page.size}`)
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
                        items: result.content,
                        page: result.page
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                        items: [],
                    });
                }
            );
    }

    setPage(page) {
        this.setState({currentPage: page-1});
        this.loadPage(page-1);
    }

    table() {
        const { error, isLoaded, items, page, currentPage } = this.state;
        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else if (items !== undefined) {
            return (
                <>
                    <UploadsTable items={items}></UploadsTable>
                    <PaginationComponent currentPage={currentPage+1}
                                         itemsCount={page.totalElements}
                                         itemsPerPage={page.size}
                                         setCurrentPage={this.setPage}></PaginationComponent>
                </>
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
