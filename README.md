# book-trader
App for lending books to friends

(React / Flask / OAuth / PostgreSQL)

**Live Demo:** https://joel-bentley-book-trader.herokuapp.com/

---

To use, first log in to your Twitter account and create Twitter app at `apps.twitter.com`.

Set `TWITTER_KEY` and `TWITTER_SECRET` environmental variables (can put these in `.env` file).

You should also set SECRET_KEY environmental variable to random string.

Check variables in `.env` file and run file as script.

Create Python virtual environment in project folder with command `python -m venv env`.

Activate Python virtual environment with `env/bin/activate` on command line (or run `.env` script again).

Create PostgreSQL database with name and location provided in `.env` file.

To install dependencies type:  `pip install -r requirements.txt`

Then, to start Flask server type:  `python app.py`

To start client dev server type `cd client && npm start` from project root.

To build client code for production, type `cd client && npm run build` from project root.
