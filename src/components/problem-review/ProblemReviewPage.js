import React, {Component} from 'react';
import {Container, Alert, Spinner, Col, Row, Button} from 'react-bootstrap';
import API from "../../api";
import ProblemForm from "../misc/ProblemForm";
import PinnedOCRCards from './PinnedOCRCards';

class ProblemReviewPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            problem: null,
            submitting: false,
            newProblem: false,
            upload: null,
            ocrs: [],
            unsyncPictures: []
        };

        this.submit = this.submit.bind(this);
        this.getProblem = this.getProblem.bind(this);
        this.getUpload = this.getUpload.bind(this);
        this.getOCRs = this.getOCRs.bind(this);
        this.getUnsyncPictures = this.getUnsyncPictures.bind(this);
        this.syncToCore = this.syncToCore.bind(this);
    }

    componentDidMount() {
        if (this.props.match.params.id === 'new') {
            this.setState({
                isLoaded: true,
                newProblem: true,
                syncing: false,
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

        this.getProblem();
    }

    getProblem() {
        API.problems.get(parseInt(this.props.match.params.id, 10))
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        problem: result,
                    }, () => this.getOCRs());
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
        console.log(problem);
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
                    }, () => {
                        this.getUpload();
                        this.getUnsyncPictures();
                        
                    })
                }, 
                (error) => {
                    this.setState({
                        error,
                        ocrs: []
                    });
                }
            );
    }

    getUpload() {
        const {ocrs} = this.state;

        if(ocrs.length !== 0) {
            API.ocr.getUpload(ocrs[0].id)
                .then(
                    (result) => {
                        this.setState({upload: result})
                    }, 
                    (error) => {
                        this.setState({error, upload: null});
                    }
                );
        }
    }

    getUnsyncPictures() {
        const {ocrs, problem} = this.state;

        const OCRPictures = ocrs.filter(r => r.type === "PICTURE");
        const OCRAttachments = problem.attachments
            .filter(r => r.metadata.type === "ocr");

        let unsyncPictures = OCRPictures.filter(result => 
            OCRAttachments.findIndex(attachment => attachment.metadata.ocrId === result.id) === -1
        );
        
        this.setState({unsyncPictures});
    }

    syncToCore() {
        const {problem} = this.state;

        this.setState({syncing: true});
        API.problems.syncToCore(problem.id)
            .then(r => {
                alert(`Problem ${problem.id} is scheduled to be synced with Core API`);
                this.setState({syncing: false});
            });
    }
    

    content() {
        const {error, isLoaded, problem, unsyncPictures, upload} = this.state;

        if (error) {
            return <Alert variant="danger">Error: {error.message}</Alert>;
        } else if (!isLoaded) {
            return <Spinner animation="border" role="status" className="text-center">
                <span className="visually-hidden">Loading...</span>
            </Spinner>;
        } else {
            const isSynced = !(problem.coreId === null || problem.coreId === undefined) && this.props.match.params.id !== 'new';
            return (
                <ProblemForm problem={problem} selected={unsyncPictures} submitting={this.state.submitting}
                             onSubmit={this.submit} upload={upload}>
                    {
                        !isSynced ? <Button variant={'secondary'}
                                           onClick={!this.state.syncing ? this.syncToCore : null}
                                           disabled={this.state.syncing}>
                            Sync to Core
                        </Button> : <Button variant={'secondary'} as={'a'}
                                            href={`https://coreui-sf.pkasila.net/problems/${problem.coreId}`}>
                            Synced as #{problem.coreId}
                        </Button>
                    }
                </ProblemForm>
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
                                <PinnedOCRCards problemId={this.props.match.params.id} 
                                    updateProblem={this.getProblem} />
                            </Col>
                        </Row>
                }
                
                {this.content()}
            </Container>
        );
    }
}

export default ProblemReviewPage;
