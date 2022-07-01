import React, {Component} from 'react';
import { Dropdown, Form } from 'react-bootstrap';
import {equations} from './equations';
import Latex from './Latex';

class EquationInserter extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            search: "",
            caseSensitive: false,
            equationsShow: []
        }

        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleCaseSensitiveChange = this.handleCaseSensitiveChange.bind(this);
        this.onCopyEquationClick = this.onCopyEquationClick.bind(this);
        this.showEquations = this.showEquations.bind(this);
    }

    componentDidMount() {
        this.showEquations();
    }

    handleSearchChange(e) {
        this.setState({search: e.target.value}, () => this.showEquations());
    }

    handleCaseSensitiveChange(e) {
        this.setState({caseSensitive: e.target.checked},
            () => this.showEquations());
    }

    onCopyEquationClick(text) {
        navigator.clipboard.writeText(text);
    }

    showEquations() {
        this.setState({equationsShow: []}, () => {
            const equationsShow = [];
            equations.map((equation) => {
                
                const subEquation = this.state.caseSensitive ? 
                    equation.toLowerCase() : equation;
                if(subEquation.includes(this.state.search)) {
                    equationsShow.push(equation);
                }
            });

            this.setState({equationsShow});
        }); 
    }

    render() {
        return(
            <>
                <Dropdown>
                    <Dropdown.Toggle 
                        variant="outline-dark" 
                        size="sm"
                        className="mb-2">
                        Equations
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="bg-white-blurred">
                        <div className="mb-1">
                            <Form className="mb-1">
                                <Form.Control 
                                    onChange={this.handleSearchChange} 
                                    placeholder="Enter equation" />
                                <Form.Check type="checkbox" checked={this.state.caseSensitive}
                                            onChange={this.handleCaseSensitiveChange}
                                            label="Case sensitive" />
                            </Form>
                        </div>
                        <Dropdown.Divider />
                        <div className="overflow-scroll"  style={{height: "250px"}}>
                            {this.state.equationsShow.length !== 0 ? 
                            this.state.equationsShow.map((equation, index) => 
                                <Dropdown.Item 
                                    key={index}
                                    className="row"
                                    onClick={() => this.onCopyEquationClick(equation)}>
                                        <div className='row'>
                                            <div className='col'>
                                                <Latex children={`$${equation}$`} />
                                            </div>
                                            <div className='col'>
                                                <p className="sm" style={{color: "#BDBDBD"}}>{equation}</p>
                                            </div>
                                        </div>
                                </Dropdown.Item>
                            ) : <Dropdown.Item className="text-center" disabled={true}>
                                    Nothing was found
                                </Dropdown.Item>
                            }
                        </div>
                        
                    </Dropdown.Menu>
                </Dropdown>
            </>
        )
    }
}

export default EquationInserter;