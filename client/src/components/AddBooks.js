import React from 'react';
// import { Glyphicon } from 'react-bootstrap'
import axios from 'axios';

import ControlledInput from './ControlledInput';
import BookGrid from './BookGrid';

const searchBooks = searchText => {
  searchText = searchText.replace(/[^0-9a-zA-Z$-_.+!*'(),]+/g, '+');

  console.log({ searchText });

  return axios
    .get(`https://openlibrary.org/search.json?title=${searchText}&limit=20`)
    .then(res => {
      return res.data.docs
        .filter(book => {
          return book.hasOwnProperty('title_suggest') &&
            book.hasOwnProperty('author_name') &&
            book.hasOwnProperty('cover_edition_key');
        })
        .map(book => {
          return {
            title: book.title_suggest,
            subtitle: book.subtitle || null,
            author: book.author_name[0],
            olid: book.cover_edition_key,
            image: `http://covers.openlibrary.org/b/olid/${book.cover_edition_key}-M.jpg`,
          };
        });
    });
};

class AddBooks extends React.Component {
  state = { searchTerm: '', searchResults: [], loading: false };

  handleSearchSubmit = searchTerm => {
    this.setState({ loading: true });
    searchBooks(searchTerm)
      .then(searchResults => {
        this.setState({ searchTerm, searchResults, loading: false });
      })
      .catch(err => console.log('error:', err));
  };

  render() {
    const { searchTerm, searchResults, loading } = this.state;
    return (
      <div>
        <h3>Search to add books you own</h3>
        <br />
        <ControlledInput
          placeholder="Search by title"
          onSubmit={this.handleSearchSubmit}
          buttonText="Search"
        />
        {loading && (
              <div className="text-center">
                <br /><br /><br />
                <h4>Loading...</h4>
              </div>
            )}
        {searchTerm && (
              <div>
                <br /><br />
                <h4>Search Term: {searchTerm}</h4>
                <br /><br />
                {
                  searchResults.length === 0
                    ? <p>None found.</p>
                    : (
                      <BookGrid
                        books={searchResults}
                        addBook={this.props.addBook}
                      />
                    )
                }
              </div>
            )}
      </div>
    );
  }
}

export default AddBooks;
