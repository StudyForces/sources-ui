import React, {Component} from 'react';
import {Container, Alert, Spinner, Col, Row} from 'react-bootstrap';
import API from "../../api";
import ProblemForm from "../misc/ProblemForm";
import PinnedOCRCards from './PinnedOCRCards';
import CreateUploadButton from "../uploads/CreateUploadButton";

class ProblemReviewPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            problem: null,
            submitting: false,
            newProblem: false,
            ocrs: [],
            unsyncPictures: []
        };

        this.submit = this.submit.bind(this);
        this.getUnsyncPictures = this.getUnsyncPictures.bind(this);
        this.getOCRs = this.getOCRs.bind(this);
    }

    componentDidMount() {
        if (this.props.match.params.id === 'new') {
            this.setState({
                isLoaded: true,
                newProblem: true,
                problem: {
                    attachments: [],
                    problem: '',
                    solution: '',
                    solverMetadata: null,
                    type: 'STATIC'
                }
            });
            return;
        }

        API.problems.get(parseInt(this.props.match.params.id, 10))
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        problem: result,
                    }, this.getOCRs());
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
        if (this.state.newProblem) {
            API.problems.create(problem, []).then(p => {
                this.setState({submitting: false, problem: p}, () => {
                    this.props.history.push(`/problems/${p.id}`);
                    cb();
                });
            });
        } else {
            API.problems.update(this.state.problem.id, problem).then(p => {
                this.setState({submitting: false, problem: p}, cb);
            });
        }
    }

    getOCRs() {
        API.problems.getOCRResults(parseInt(this.props.match.params.id, 10))
            .then(
                (result) => {
                    this.setState({
                        ocrs: result
                    }, this.getUnsyncPictures());
                }, 
                (error) => {
                    this.setState({
                        error,
                        ocrs: []
                    });
                }
            );
    }

    getUnsyncPictures() {
        const {ocrs} = this.state;
        const picures = ocrs.filter(r => r.type === "PICTURE");
        const attachments = this.state.problem.attachments;
        console.log(attachments);
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
                {
                    this.props.match.params.id === 'new' ?
                        <h1>New Problem</h1> :
                        <Row className="align-items-center mb-3" sm={2}>
                            <Col>
                                <h1 className="m-0">Problem #{this.props.match.params.id}</h1>
                            </Col>
                            <Col className="text-end">
                                <PinnedOCRCards problemId={this.props.match.params.id}/>
                            </Col>
                        </Row>
                }
                {this.content()}
            </Container>
        );
    }
}

export default ProblemReviewPage;
