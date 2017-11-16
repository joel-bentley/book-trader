import React from 'react';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import axios from 'axios';

import ControlledInput from './ControlledInput';
import BookGrid from './BookGrid';

const searchBooks = (searchText, method) => {
  searchText = searchText.replace(/[^0-9a-zA-Z$-_.+!*'(),]+/g, '+');
  console.log({ searchText });

  return axios
    .get(`https://openlibrary.org/search.json?${method}=${searchText}&limit=20`)
    .then(res => {
      return res.data.docs
        .filter(book => {
          return (
            book.hasOwnProperty('title') &&
            book.hasOwnProperty('author_name') &&
            book.hasOwnProperty('cover_edition_key')
          );
        })
        .map(book => {
          return {
            title: book.title,
            subtitle: book.subtitle || null,
            author: book.author_name[0],
            olid: book.cover_edition_key,
            image: `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`,
          };
        });
    });
};

class AddBooks extends React.Component {
  state = {
    searchTerm: '',
    searchResults: [],
    searchMethod: 'q',
    searchMethodText: 'Keywords',
    loading: false,
  };

  handleSearchSubmit = searchTerm => {
    const { searchMethod } = this.state;
    const searchMethodText = {
      q: 'Keywords',
      title: 'Title',
      author: 'Author',
    }[searchMethod];
    this.setState({ searchMethodText, loading: true });
    searchBooks(searchTerm, searchMethod)
      .then(searchResults => {
        this.setState({ searchTerm, searchResults, loading: false });
      })
      .catch(err => console.error('error:', err));
  };

  handleSelect = eventKey => {
    this.setState({ searchMethod: eventKey });
  };

  render() {
    const {
      searchTerm,
      searchResults,
      loading,
      searchMethod,
      searchMethodText,
    } = this.state;
    return (
      <div>
        <h3>Search to add books you own</h3>
        <br />
        <Nav
          bsStyle="tabs"
          activeKey={searchMethod}
          onSelect={this.handleSelect}
        >
          <NavItem eventKey="q">Keywords</NavItem>
          <NavItem eventKey="title">Title</NavItem>
          <NavItem eventKey="author">Author</NavItem>
        </Nav>
        <ControlledInput
          placeholder=""
          onSubmit={this.handleSearchSubmit}
          buttonText="Search"
        />
        {loading && (
          <div className="text-center">
            <br />
            <br />
            <br />
            <h4>Loading...</h4>
          </div>
        )}
        {searchTerm && (
          <div>
            <br />
            <br />
            <h4>
              Search by {searchMethodText}: {searchTerm}
            </h4>
            <br />
            <br />
            {searchResults.length === 0 ? (
              <p>None found.</p>
            ) : (
              <BookGrid books={searchResults} addBook={this.props.addBook} />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default AddBooks;
