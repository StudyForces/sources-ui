import React, { Component } from 'react';
import API from "../../api";
import ProblemForm from "../misc/ProblemForm";

class ProblemSubmissionForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: []
        }

        this.submit = this.submit.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
        return {
            selected: props.selected
        };
    }

    submit(problem, cb) {
        this.setState({submitting: true});
        API.problems.create(problem, this.props.selected).then(p => {
            this.setState({submitting: false}, () => this.props.onSubmit(cb));
        });
    }

    render() {
        return <ProblemForm selected={this.state.selected} submitting={this.state.submitting}
                            onSubmit={this.submit}></ProblemForm>;
    }
}

export default ProblemSubmissionForm;
