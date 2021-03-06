import {Button, Container, Dropdown, Nav, Navbar} from "react-bootstrap";
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
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="misc-navbar">
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
                        <Nav.Link as={NavLink} to="/uploads">Uploads</Nav.Link>
                        <Nav.Link as={NavLink} to="/problems">Problems</Nav.Link>
                    </Nav>
                    {
                        keycloak.authenticated ?
                        (<Dropdown className="d-flex">
                            <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                                {getUsername()}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item href={keycloak.createAccountUrl()}>My Account</Dropdown.Item>
                                <Dropdown.Divider />
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
