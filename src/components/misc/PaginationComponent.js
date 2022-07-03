import React, {useEffect, useState} from "react";
import Pagination from "react-bootstrap/Pagination";
import {scrollToTop} from "../helpers/scroll";
import PropTypes from "prop-types";
import {Button, Col, FormControl, InputGroup, Row} from "react-bootstrap";

const PaginationComponent = ({
                                 itemsCount,
                                 itemsPerPage,
                                 currentPage,
                                 setCurrentPage,
                                 alwaysShown = true
                             }) => {
    const pagesCount = Math.ceil(itemsCount / itemsPerPage);
    const isPaginationShown = alwaysShown ? true : pagesCount > 1;
    const isCurrentPageFirst = currentPage === 1;
    const isCurrentPageLast = currentPage === pagesCount;

    const changePage = number => {
        if (currentPage === number) return;
        setCurrentPage(number);
        scrollToTop();
    };

    const onPageNumberClick = pageNumber => {
        changePage(pageNumber);
    };

    const onPreviousPageClick = () => {
        changePage(currentPage - 1);
    };

    const onNextPageClick = () => {
        changePage(currentPage + 1);
    };

    const setLastPageAsCurrent = () => {
        if (currentPage > pagesCount) {
            setCurrentPage(pagesCount);
        }
    };

    let isPageNumberOutOfRange;

    const pageNumbers = [...new Array(pagesCount)].map((_, index) => {
        const pageNumber = index + 1;
        const isPageNumberFirst = pageNumber === 1;
        const isPageNumberLast = pageNumber === pagesCount;
        const isCurrentPageWithinTwoPageNumbers =
            Math.abs(pageNumber - currentPage) <= 2;

        if (
            isPageNumberFirst ||
            isPageNumberLast ||
            isCurrentPageWithinTwoPageNumbers
        ) {
            isPageNumberOutOfRange = false;
            return (
                <Pagination.Item
                    key={pageNumber}
                    onClick={() => onPageNumberClick(pageNumber)}
                    active={pageNumber === currentPage}
                >
                    {pageNumber}
                </Pagination.Item>
            );
        }

        if (!isPageNumberOutOfRange) {
            isPageNumberOutOfRange = true;
            return <Pagination.Ellipsis key={pageNumber} className="muted"/>;
        }

        return null;
    });

    useEffect(setLastPageAsCurrent, [pagesCount]);

    const [searchPage, setSearchPage] = useState();
    const isGoActive = searchPage >= 1 && searchPage <= pagesCount && !isNaN(searchPage);

    return isPaginationShown && (
        <>
            <Row sm={2} className="align-items-center">
                <Col sm="auto">
                    <Pagination className="m-0">
                        <Pagination.Prev
                            onClick={onPreviousPageClick}
                            disabled={isCurrentPageFirst}
                        />
                        {pageNumbers}
                        <Pagination.Next
                            onClick={onNextPageClick}
                            disabled={isCurrentPageLast}
                        />
                    </Pagination>
                </Col>
                <Col sm="auto">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (isGoActive) {
                            onPageNumberClick(searchPage);
                        }
                    }}>
                        <InputGroup>
                            <FormControl type="number" size="sm" style={{width: '100px'}} onChange={(e) => {
                                setSearchPage(parseInt(e.target.value, 10));
                            }}/>
                            <Button size="sm" variant="outline-secondary" disabled={!isGoActive}
                                    onClick={isGoActive ? () => onPageNumberClick(searchPage) : null}>
                                Go
                            </Button>
                        </InputGroup>
                    </form>
                </Col>
            </Row>
        </>
    );
};

PaginationComponent.propTypes = {
    itemsCount: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    setCurrentPage: PropTypes.func.isRequired,
    alwaysShown: PropTypes.bool
};

export default PaginationComponent;
