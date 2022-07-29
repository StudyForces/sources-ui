import { Component } from "react";
import { Card } from "react-bootstrap";

class ProblemSolveForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            solverMetadata: props.solverMetadata
        }

        this.solveContent = this.solveContent.bind(this);
    }

    solveContent() {
        if(true) {
            return (
                <div>
                    {/* <h6>Preview</h6>
                    <div className="my-2">
                        <ReactKatex strict={false} children={this.state.solve}></ReactKatex>
                    </div>
                    <Form.Group controlId="taskSubmission.solveLatex">
                        <Form.Label as={"h6"}>LaTeX</Form.Label>
                        <EquationInserter />
                        <Form.Control as="textarea" rows={3} defaultValue={this.state.solve}
                                        onChange={(event) => {
                                            this.setState({solve: event.target.value});
                                        }}/>
                    </Form.Group> */}
                </div>
            )
        } else if(true) {
            return (
                <div>

                </div>
            )
        } else if(true) {
            return (
                <div>

                </div>
            )
        }
    }

    render() {
        return (
            <Card.Body>


                {this.solveContent()}
            </Card.Body>
        )
    }
}

export default ProblemSolveForm;