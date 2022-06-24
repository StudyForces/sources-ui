import React from "react";
import PropTypes from "prop-types";
import {HtmlGenerator, parse} from "latex.js";
import {Alert} from "react-bootstrap";

const latexify = (string) => {
    let generator = new HtmlGenerator({ hyphenate: false })

    return parse(string, {generator: generator}).htmlDocument().documentElement.querySelector('div.body');
};

class Latex extends React.Component {
    static propTypes = {
        children: PropTypes.string,
        spanned: PropTypes.bool
    };

    static defaultProps = {
        children: "",
        spanned: false
    };

    render() {
        const {
            children,
            spanned
        } = this.props;

        try {
            let node = latexify(children);

            if (spanned) {
                let newNode = document.createElement('span'),
                    childNodes = node.childNodes;

                childNodes.forEach((elem) => {
                    const spanned = document.createElement('span');
                    spanned.innerHTML = elem.innerHTML + '<br />';
                    newNode.appendChild(spanned);
                });

                node = newNode;
            }

            return <span dangerouslySetInnerHTML={{__html: node.outerHTML}}></span>;
        } catch (e) {
            return <Alert variant="danger">{e.message}</Alert>;
        }
    }
}

export default Latex;
