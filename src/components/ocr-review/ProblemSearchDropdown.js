import React, {Component} from 'react';
import {Dropdown, Form, Spinner, Popover, OverlayTrigger, Badge, Button} from "react-bootstrap";
import API from "../../api";
import PaginationComponent from '../misc/PaginationComponent';

class ProblemSearchDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            search: "",
            searching: false,
            problems: [],
            currentPage: 0,
            page: {size: 20, totalElements: 0, totalPages: 0, number: 0}
        }

        this.menuContent = this.menuContent.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.getProblems = this.getProblems.bind(this);
        this.setPage = this.setPage.bind(this);
    }

    componentDidMount() {
        this.getProblems();
    }

    setPage(page) {
        this.setState({currentPage: page-1}, () => this.getProblems());
    }

    getProblems() {
        const {search, currentPage, page} = this.state;

        this.setState({searching: true}, () => {
            API.problems.search(search, currentPage, page.size)
            .then(
                (result) => this.setState({
                    problems: result.content, 
                    searching: false,
                    page: {
                        size: result.size,
                        totalElements: result.totalElements,
                        totalPages: result.totalPages,
                        number: result.number
                    }
                }),
                (error) => this.setState({error, problems: [], searching: false})
            )
        });
    }

    handleSearchChange(e) {
        this.setState({search: e.target.value}, () => this.getProblems());
    }

    menuContent() {
        const {error, problems, searching} = this.state;

        if(error){
            return (<Dropdown.Item className="text-center" disabled={true}>
                        Error: {error.message}
                    </Dropdown.Item>);
        } else if(searching) {
            return (<Dropdown.Item className="text-center" disabled={true}>
                        <Spinner animation="border" role="status" size="sm" className="me-2" />
                        Searching...
                    </Dropdown.Item>);
        } else if(problems.length === 0) {
            return (<Dropdown.Item className="text-center" disabled={true}>
                        Nothing was found
                    </Dropdown.Item>);
        } else {
            return(
                problems.map((problem, index) => 
                    <Dropdown.Item key={index} onClick={() => this.props.onOpenProblemClick(problem)}>
                        {problem.id}
                    </Dropdown.Item>
                )
            )
        }
    }

    render() {
        const {currentPage, page} = this.state;

        return(
            <>
                <Dropdown align="end">
                    <Dropdown.Toggle style={{cursor: "pointer"}} as={"a"}>Pin problem</Dropdown.Toggle>
                    <Dropdown.Menu style={{width: "max-content"}}>
                        <div className="mb-1">
                            <Form className="mb-1">
                                <Form.Control
                                    style={{width: "100%"}}
                                    onChange={this.handleSearchChange}
                                    placeholder="Enter problem ID" />
                            </Form>
                            <PaginationComponent
                                    currentPage={currentPage+1}
                                    itemsCount={page.totalElements}
                                    itemsPerPage={page.size}
                                    setCurrentPage={this.setPage} />
                        </div>
                        <Dropdown.Divider />
                        <div className="overflow-scroll"  style={{height: "250px"}}>
                            {this.menuContent()}
                        </div>

                    </Dropdown.Menu>
                </Dropdown>

                
            </>
        )
    }

    // getShowProblems() {
    //     const {problems, search} = this.state;

    //     this.setState({problemsShow: []}, () => {
    //         const problemsShow = [];
    //         problems.forEach((problem) => {
    //             if(problem.id.toString().includes(search)) {
    //                 problemsShow.push(problem);
    //             }
    //         })

    //         this.setState({problemsShow});
    //     });
    // }
}

export default ProblemSearchDropdown;