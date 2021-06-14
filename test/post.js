const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Post = require('../models/Post');
const app = require('../app');
const { expect, assert } = require('chai');

const should = chai.should();
chai.use(chaiHttp);

describe('Post', () => {
  const user = {
    firstName: 'Asidipta',
    lastName: 'Chaudhuri',
    username: 'testpost',
    email: 'testpost@test.com',
    password: 'test',
  };
  let token = '';
  let id = '';

  before((done) => {
    User.create(user, (error, result) => {
      if (!error) {
        id = result._id.toString();
      }
      jwt.sign(
        {
          user: {
            _id: id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
          },
        },
        process.env.SECRET,
        (err, tok) => {
          if (!err && tok) {
            token = tok;
          }
          done();
        }
      );
    });
  });
  after((done) => {
    User.remove({ username: user.username }, (error) => {
      done();
    });
  });

  // Testing create post
  describe('POST /create createPost()', () => {
    let post_id = '';
    it('should create a new post', (done) => {
      chai
        .request(app)
        .post('/create')
        .set('user', token)
        .send({ content: 'Test post' })
        .end((error, res) => {
          if (!error) {
            post_id = res.body.post._id.toString();
          }
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          expect(res.body.message).to.include('successfully');
          res.body.should.have.property('post').should.be.a('object');
          done();
        });
    });
    // Testing comment on post
    describe('POST /post/comment createComment()', () => {
      it('should create a new comment on post', (done) => {
        chai
          .request(app)
          .post('/post/comment')
          .set('post_id', post_id)
          .set('user', token)
          .send({ content: 'This is test comment' })
          .end((error, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.should.have
              .property('existing_post')
              .should.be.a('object');
            res.body.existing_post.comments.should.be.a('array');
            assert.strictEqual(
              res.body.existing_post.comments[0].content,
              'This is test comment'
            );
            assert.isAbove(res.body.existing_post.comments.length, 0);
            expect(res.body.message).to.include('added');
            done();
          });
      });
    });
    //Testing like on post
    describe('GET /post/like likePost()', () => {
      it('should toggle like to post', (done) => {
        chai
          .request(app)
          .get('/post/like')
          .set('post_id', post_id)
          .set('user', token)
          .end((error, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have
              .property('existing_post')
              .should.be.a('object');
            res.body.should.have.property('message');
            assert.isAbove(res.body.message.length, 0);
            done();
          });
      });
    });
    // Getting post by user
    describe('GET /posts getPostByUser()', () => {
      it('should get posts by user', (done) => {
        chai
          .request(app)
          .get('/posts')
          .set('user', token)
          .end((error, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('posts');
            res.body.posts.should.be.a('array');
            done();
          });
      });
    });
    // Getting post by id
    describe('GET /post/post_id getPostById()', () => {
      it('should get post with id', (done) => {
        chai
          .request(app)
          .get(`/post/${post_id}`)
          .set('user', token)
          .end((error, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('content').eql('Test post');
            res.body.should.have.property('author');
            res.body.author.should.have.property('_id').eql(id);
            res.body.should.have.property('comments');
            res.body.comments.should.be.a('array');
            res.body.should.have.property('likes');
            res.body.likes.should.be.a('array');
            done();
          });
      });
    });
    after((done) => {
      Post.remove({ content: 'Test post' }, (error) => {
        done();
      });
    });
  });
});
