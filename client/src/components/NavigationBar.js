import React from 'react';
import { Link } from 'react-router';
import {
  Glyphicon,
  Navbar,
  NavDropdown,
  MenuItem,
  Nav,
  NavItem,
} from 'react-bootstrap';

const NavigationBar = (
  { router, isAuthenticated, displayName, avatar, reqNumber },
) =>
  {
    return (
      <Navbar fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">
              <Glyphicon glyph="book" aria-hidden="true" />
              Book Trader
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <Link to="/">
              {
              ({ href, onClick }) => (
                <NavItem href={href} onClick={onClick} eventKey={1}>
                   Home 
                </NavItem>
              )
            }
            </Link>
            {
              isAuthenticated &&
                (
                  <Link to="/mybooks">
                    {
                    ({ href, onClick }) => (
                      <NavItem href={href} onClick={onClick} eventKey={2}>
                         My Books 
                      </NavItem>
                    )
                  }
                  </Link>
                )
            }
            {
              isAuthenticated &&
                (
                  <Link to="/addbooks">
                    {
                    ({ href, onClick }) => (
                      <NavItem href={href} onClick={onClick} eventKey={3}>
                         Add Books 
                      </NavItem>
                    )
                  }
                  </Link>
                )
            }
            {
              isAuthenticated &&
                (
                  <Link to="/requests">
                    {
                    ({ href, onClick }) => (
                      <NavItem href={href} onClick={onClick} eventKey={4}>
                        {`Book Requests (${reqNumber})`}
                      </NavItem>
                    )
                  }
                  </Link>
                )
            }
          </Nav>
          <Nav pullRight>
            {isAuthenticated ? (
                  <NavDropdown
                    title={
                      (
                        <span>
                          <img src={avatar} role="presentation" />{displayName}
                        </span>
                      )
                    }
                    eventKey={5}
                    id="basic-nav-dropdown"
                  >
                    <MenuItem
                      onSelect={() => {
                          router.transitionTo('/profile');
                        }}
                      eventKey={5.1}
                    >
                       Profile 
                    </MenuItem>
                    <MenuItem
                      href={`${process.env.PUBLIC_URL}/logout`}
                      eventKey={5.2}
                    >
                       Logout 
                    </MenuItem>
                  </NavDropdown>
                ) : <Link to="/login">{({ href, onClick }) => <NavItem href={href} onClick={onClick} eventKey={5}> Login </NavItem>}</Link>}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  };

export default NavigationBar;
