import {Button, Container, Dropdown, Nav, Navbar, NavDropdown} from "react-bootstrap";
import {NavLink, useHistory} from "react-router-dom";
import {useKeycloak} from "@react-keycloak/web";

export default function Header() {
    const { keycloak } = useKeycloak()
    const history = useHistory();

    const handleLogInOut = () => {
        if (keycloak.authenticated) {
            history.push('/')
            keycloak.logout()
        } else {
            keycloak.login()
        }
    }

    const getUsername = () => {
        return keycloak.authenticated && keycloak.tokenParsed && keycloak.tokenParsed.name
    }

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                <Navbar.Brand as={NavLink} to="/">Sources Toolkit</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav
                        className="me-auto my-2 my-lg-0"
                        style={{ maxHeight: '100px' }}
                        navbarScroll
                    >
                        <Nav.Link as={NavLink} exact to="/home">Home</Nav.Link>
                        <NavDropdown title="Uploads" id="navbarScrollingDropdown">
                            <NavDropdown.Item as={NavLink} to="/uploads">All</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={NavLink} to="/uploads?filter=noRects">Non-rected</NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/uploads?filter=rects">Rected</NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/uploads?filter=ocred">OCRed</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={NavLink} to="/uploads?filter=sent">
                                Sent
                            </NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link as={NavLink} to="/uploads">Uploads</Nav.Link>
                    </Nav>
                    {
                        keycloak.authenticated ?
                        (<Dropdown className="d-flex">
                            <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                                {getUsername()}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item as={NavLink} to="/login" onClick={handleLogInOut}>Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>) : (
                            <Button as={NavLink} exact to="/login" onClick={handleLogInOut}>Login</Button>
                        )
                    }
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
