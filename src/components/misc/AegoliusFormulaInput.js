import ReactKatex from "@pkasila/react-katex";
import {useEffect, useState} from "react";
import useDebounce from "./useDebounce";
import aegoliusConfig from "./aegolius-config.json";
import {Form} from "react-bootstrap";

export default function AegoliusFormulaInput({formula, onChange}) {
    const [currentFormula, setCurrentFormula] = useState(formula);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState({output: formula});
    const debouncedFormula = useDebounce(currentFormula, 500);

    useEffect(() => {
        if (debouncedFormula.length === 0) {
            setResult({output: '\\text{empty}'});
            return;
        }

        setLoading(true);
        fetch(`https://aegolius.pkasila.net/api/formulas/evaluate`, {
            method: 'POST',
            headers: {
                'Authorization': `Aegolius ${aegoliusConfig.auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({input: debouncedFormula})
        })
            .then(r => {
                if (r.ok) {
                    return r.json();
                }
                return {output: '\\text{syntax error}', unset: true};
            })
            .then((res) => {
                setResult(res);
                !res.unset && onChange(debouncedFormula);
                setLoading(false);
            });
    }, [debouncedFormula]);

    return <div>
        <div className={'mb-3'}>
            <ReactKatex breakLine={true} strict={false} children={`$$${result.output ?? formula ?? ''}$$`}></ReactKatex>
        </div>
        <Form.Control
            as="textarea"
            rows={3}
            placeholder='Formula...'
            value={currentFormula}
            onChange={(e) => setCurrentFormula(e.target.value)}/>
    </div>;
}
