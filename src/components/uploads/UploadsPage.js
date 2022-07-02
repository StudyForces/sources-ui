import React, { Component } from 'react';
import {Container, Alert, Spinner, Row, Col} from "react-bootstrap";
import UploadsTable from "./UploadsTable";
import PaginationComponent from "../misc/PaginationComponent";
import API from "../../api";
import CreateUploadButton from "./CreateUploadButton";

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
        this.onRemove = this.onRemove.bind(this);
    }

    componentDidMount() {
        this.loadPage(this.state.currentPage, this.state.page.size);
    }

    loadPage(page) {
        API.uploads.list(page ?? this.state.currentPage, this.state.page.size)
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: result.content,
                        page: {
                            size: result.size,
                            totalElements: result.totalElements,
                            totalPages: result.totalPages,
                            number: result.number
                        }
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

    onRemove() {
        this.loadPage();
    }

    table() {
        const { error, isLoaded, items, page, currentPage } = this.state;
        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            return (
                <>
                    <UploadsTable items={items} onRemove={this.onRemove}></UploadsTable>
                    <PaginationComponent currentPage={currentPage+1}
                                         itemsCount={page.totalElements}
                                         itemsPerPage={page.size}
                                         setCurrentPage={this.setPage}></PaginationComponent>
                </>
            );
        }
    }

    render() {
        return (
            <Container className="mt-3">
                <Row>
                    <Col>
                        <h1>Uploads</h1>
                    </Col>
                    <Col md="auto">
                        <CreateUploadButton {...this.props}></CreateUploadButton>
                    </Col>
                </Row>
                { this.table() }
            </Container>
        );
    }
}

export default UploadsPage;
