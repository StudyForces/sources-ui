import { Card, Form, Button, InputGroup } from "react-bootstrap";
import ReactKatex from "@pkasila/react-katex";
import EquationInserter from './EquationInserter';
import { ProblemSolveType, ProblemSolveVariantType } from "../helpers/problem-solve-types";

const emptySolverMetadata = {
    type: ProblemSolveType.FORMULA,
    variants: [],
    correct: null,
    formula: null
};

function ProblemSolveForm(props) {
    const {solverMetadata, setSolverMetadata} = props;

    const setType = (event) => {
        let _solverMetadata = emptySolverMetadata;
        _solverMetadata.type = event.target.value;

        setSolverMetadata(_solverMetadata);
    }

    const handleFormulaChange = (event) => {
        let _solverMetadata = {...solverMetadata, formula: event.target.value}

        setSolverMetadata(_solverMetadata);
    }

    const handleNumberChange = (event) => {
        const input = event.target.value;
        const _solverMetadata = {
            ...solverMetadata,
            correct: {
                type: ProblemSolveType.NUMBER,
                number: input ? parseFloat(input) : null,
                string: null,
                index: null
            }
        };

        setSolverMetadata(_solverMetadata);
    }

    const handleVariantChange = (event, index) => {
        let _solverMetadata = {...solverMetadata};
        let variantToChange = solverMetadata.variants[index];
        variantToChange.string = event.target.value;
        _solverMetadata.variants[index] = variantToChange;

        setSolverMetadata(_solverMetadata);
    }

    const setCorrectVariant = (event) => {
        const index = event.target.id;
        if(event.target.value === 'on'){
            let _solverMetadata = {...solverMetadata};
            _solverMetadata.correct.index = index.length !== 0 ? parseInt(index) : 0;

            setSolverMetadata(_solverMetadata);
        }
        
    }

    const addVariant = () => {
        let _solverMetadata = {...solverMetadata};
        if(_solverMetadata.variants.length === 0) {
            _solverMetadata.correct = {
                type: ProblemSolveVariantType.INDEX,
                number: null,
                string: null,
                index: 0
            }
        }

        _solverMetadata.variants.push({
            type: ProblemSolveVariantType.STRING,
            number: null,
            string: "",
            index: null
        });

        setSolverMetadata(_solverMetadata);
    }

    const removeVariant = (index) => {
        let _solverMetadata = {...solverMetadata};
        _solverMetadata.variants.splice(index);
        if(_solverMetadata.variants.length === 0) {
            _solverMetadata.correct = null;
        } else {
            _solverMetadata.correct = {
                type: ProblemSolveVariantType.INDEX,
                number: null,
                string: null,
                index: 0
            }
        }

        setSolverMetadata(_solverMetadata);
    }

    const solveContent = () => {
        switch (solverMetadata.type) {
            case ProblemSolveType.FORMULA:
                return(
                    <>
                        <h6>Preview</h6>
                        <div className="mt-2">
                            <ReactKatex 
                                strict={false} 
                                children={`$${solverMetadata.formula ?? ''}$`} />
                        </div>
                        <Form.Group controlId="taskSubmission.solveLatex">
                            <Form.Label as={"h6"}>LaTeX</Form.Label>
                            <EquationInserter />
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                placeholder='Formula...'
                                value={solverMetadata.formula ?? ''}
                                onChange={handleFormulaChange}/>
                        </Form.Group>
                    </>
                )
            case ProblemSolveType.CT_A:
                const variants = solverMetadata?.variants ?? [];

                return (
                    <>
                        <Form.Group
                            onChange={setCorrectVariant}>
                                {
                                    variants.map((variant, index) =>
                                        <InputGroup className={'mt-2'}>
                                            <InputGroup.Radio
                                                id={index}
                                                checked={solverMetadata.correct?.index === index}
                                                />
                                            <Form.Control
                                                style={{maxWidth: '300px'}}
                                                defaultValue={variant.string}
                                                onChange={(e) => handleVariantChange(e, index)}
                                                placeholder='Variant...' />
                                            <Button
                                                variant='outline-danger'
                                                onClick={() => removeVariant(index)}>
                                                    Remove
                                            </Button>
                                        </InputGroup>
                                    )
                                }
                        </Form.Group>
                        <Button
                            className={'mt-2'}
                            size={'sm'}
                            disabled={!(variants.slice(-1)[0]?.string?.length > 0 || variants.length === 0)}
                            onClick={() => addVariant()}>
                            Add new option
                        </Button>
                    </>
                );
            case ProblemSolveType.CT_B: 
                return (
                    <>
                        <Form.Control
                            type='number'
                            style={{maxWidth: '300px'}}
                            placeholder='Number...'
                            defaultValue={solverMetadata.correct?.number}
                            onChange={handleNumberChange} />
                    </>
                )
            default:
                return (<>Unknown type</>)
        }
    }

    return (
        <Card.Body>
            <Form.Select onChange={setType} value={solverMetadata.type}>
                <option value={ProblemSolveType.FORMULA}>Formula</option>
                <option value={ProblemSolveType.CT_A}>ЦТ (часть A)</option>
                <option value={ProblemSolveType.CT_B}>ЦТ (часть B)</option>
            </Form.Select>

            <div className={'mt-2'}>
                {solveContent()}
            </div>
        </Card.Body>
    )
}

export default ProblemSolveForm;