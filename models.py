from app import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    twitter_id = db.Column(db.String(80), unique=True)
    twitter_name = db.Column(db.String(80), unique=True)

    def __init__(self, twitter_id, twitter_name):
        self.twitter_id = twitter_id
        self.twitter_name = twitter_name

    def __repr__(self):
        return '<User(id={}, twitter_id={}, twitter_name={})>'.format(self.id, self.twitter_id, self.twitter_name)


class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    twitter_name = db.Column(db.String(80))
    text = db.Column(db.String(140))
    image = db.Column(db.String(140))

    def __init__(self, twitter_name, text, image):
        self.twitter_name = twitter_name
        self.text = text
        self.image = image

    def __repr__(self):
        return '<Book(id={}, twitter_name={})>'.format(self.id, self.twitter_name)
