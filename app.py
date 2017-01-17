import os
from flask import Flask
from flask import redirect, request, send_from_directory, session, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api

app = Flask(__name__, static_folder='client/build', static_url_path='')
app.config.from_object(os.environ['APP_SETTINGS'])

api = Api(app)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)

from api_routes import Profile, Books
from models import User, Book
from auth import twitter

# @app.before_first_request
# def create_tables():
#     db.create_all()


@twitter.tokengetter
def get_twitter_token(token=None):
    return session.get('twitter_token')


api.add_resource(Profile, '/api/profile')
api.add_resource(Books, '/api/books')


@app.route('/')
def home():
    """Route for html file with single page React app."""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/auth/twitter')
def twitter_auth():
    return twitter.authorize(callback=url_for('twitter_auth_callback'), next=None)


@app.route('/auth/twitter/callback')
def twitter_auth_callback():
    next_url = url_for('home')
    resp = twitter.authorized_response()

    if resp is None:
        print('Error: reason=%s error=%s' % (
            request.args['error_reason'],
            request.args['error_description']
        ))
        return redirect(next_url)

    session['twitter_token'] = (
        resp['oauth_token'],
        resp['oauth_token_secret']
    )
    twitter_name = resp['screen_name']
    twitter_id = resp['user_id']

    session['twitter_name'] = twitter_name
    session['twitter_id'] = twitter_id

    # Twitter id does not change for an account,
    #   but a user can change name through Twitter.
    # user = User.query.filter_by(twitter_id=twitter_id).first()
    #
    # if user:
    #    if user.twitter_name != twitter_name:
    #        user.twitter_name = twitter_name
    #        db.session.commit()
    # else:
    #     new_user = User(twitter_id, twitter_name)
    #     db.session.add(new_user)
    #     db.session.commit()

    return redirect(next_url)


@app.route('/logout')
def logout():
    """Logout by removing session keys."""
    session.pop('twitter_name', None)
    session.pop('twitter_id', None)
    session.pop('twitter_token', None)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run()
