#book-trader
Built for Book Trading Club challenge on Free Code Camp.

**Live Demo:** ~~https://joel-bentley-book-trader.herokuapp.com/~~ (In progress)

---

User story requirements for this project: (<https://www.freecodecamp.com/challenges/manage-a-book-trading-club>)

1. As an unauthenticated user, I can view all books posted by every user..

2. As an authenticated user, I can add a new book.

3. As an authenticated user, I can update my settings to store my full name, city, and state..

4. As an authenticated user, I can propose a trade and wait for the other user to accept the trade.

---

To use, first check variables in and run script in .env file. Then create virtual environment in project folder.

Create PostgreSQL database with name and location you provided in .env file.

Create Twitter app and set TWITTER_KEY and TWITTER_SECRET environmental variables.

You should also set SECRET_KEY environmental variable to random string.

To install dependencies type:  pip install -r requirements.txt

Then, to start Flask server type:  python app.py
