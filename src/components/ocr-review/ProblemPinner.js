import React, {Component} from 'react';
import API from "../../api";
import {Dropdown, Form} from "react-bootstrap";

class ProblemPinner extends Component {
    constructor(props) {
        super(props);

        this.state = {
            problemSearch: "",
            problems: [],
            problemsShow: [],
            error: null
        }

        this.getShowProblems = this.getShowProblems.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.menuContent = this.menuContent.bind(this);
    }

    componentDidMount() {
        this.setState({problems: this.props.problems,
            problemError: this.props.problemError}, 
            () => this.getShowProblems());
    }

    handleSearchChange(e) {
        this.setState({problemSearch: e.target.value});
        this.getShowProblems();
    }

    getShowProblems() {
        this.setState({problemsShow: this.state.problems});
    }

    menuContent() {
        const {error, problemsShow} = this.state;

        if(error){
            return (<Dropdown.Item className="text-center" disabled={true}>
                        Error: {error.message}
                    </Dropdown.Item>);
        } else if(this.state.problemsShow.length === 0) {
            return (<Dropdown.Item className="text-center" disabled={true}>
                        Nothing was found
                    </Dropdown.Item>);
        } else {
            return(
                this.state.problemsShow.map((problem, index) => 
                    <Dropdown.Item key={index}>
                        {problem.id}
                    </Dropdown.Item>
                )
            )
        }
    }

    render() {
        return(
            <Dropdown align="end">
                <Dropdown.Toggle  as={"a"}>Pin problem</Dropdown.Toggle>
                <Dropdown.Menu>
                    <div className="mb-1">
                        <Form className="mb-1">
                            <Form.Control
                                onChange={this.handleSearchChange}
                                placeholder="Enter problem ID" />
                        </Form>
                    </div>
                    <Dropdown.Divider />
                    <div className="overflow-scroll"  style={{height: "250px"}}>
                        {/* {this.menuContent()} */}
                        {this.state.problemsShow.map((problem, index) => 
                            <Dropdown.Item key={index}>
                                {problem.id}
                            </Dropdown.Item>
                        )}
                    </div>

                </Dropdown.Menu>
            </Dropdown>
        )
    }
}

export default ProblemPinner;