import React, {Component} from 'react';
import {Dropdown, Form, Offcanvas, Spinner, Col, Row, Button, Modal} from "react-bootstrap";
import API from "../../api";

class ProblemSearchDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            search: "",
            searching: false,
            problems: []
        }

        this.menuContent = this.menuContent.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.getProblems = this.getProblems.bind(this);
    }

    componentDidMount() {
        this.getProblems();
    }

    getProblems() {
        const {search} = this.state;

        this.setState({searching: true});
        API.problems.search(search, 0, 20)
            .then(
                (result) => this.setState({problems: result.content, searching: false}),
                (error) => this.setState({error, problems: [], searching: false})
            )
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
        return(
            <>
                <Dropdown align="end">
                    <Dropdown.Toggle style={{cursor: "pointer"}} as={"a"}>Pin problem</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <div className="mb-1">
                            <Form className="mb-1">
                                <Form.Control
                                    style={{width: "max-content"}}
                                    onChange={this.handleSearchChange}
                                    placeholder="Enter problem ID" />
                            </Form>
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