import React, { Component } from 'react';
import {Container, Alert, Spinner} from "react-bootstrap";
import API from "../../api";
import ProblemForm from "../misc/ProblemForm";

class ProblemReviewPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            problem: null,
            submitting: false
        };

        this.submit = this.submit.bind(this);
    }

    componentDidMount() {
        API.problems.get(parseInt(this.props.match.params.id, 10))
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        problem: result,
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error,
                        problem: null,
                    });
                }
            );
    }

    submit(problem, cb) {
        this.setState({submitting: true});
        API.problems.update(this.state.problem.id, problem).then(p => {
            this.setState({submitting: false, problem: p}, cb);
        });
    }

    content() {
        const {error, isLoaded, problem} = this.state;
        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status" className="text-center">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            return (
                <ProblemForm problem={problem} selected={[]} submitting={this.state.submitting}
                             onSubmit={this.submit}></ProblemForm>
            );
        }
    }

    render() {
        return (
            <Container className="mt-3">
                <h1>Problem #{this.props.match.params.id}</h1>
                {this.content()}
            </Container>
        );
    }
}

export default ProblemReviewPage;
