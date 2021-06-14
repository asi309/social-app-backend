const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const app = require('../app');
const { assert, expect } = require('chai');

const should = chai.should();

chai.use(chaiHttp);

describe('User', () => {
  const user = {
    firstName: 'Asidipta',
    lastName: 'Chaudhuri',
    username: 'testuser',
    email: 'testuser@test.com',
    password: 'test',
  };
  // Testing createUser
  describe('POST /user/register createUser()', () => {
    it('should create a user and return jwt signed object token', (done) => {
      chai
        .request(app)
        .post('/user/register')
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.should.have.property('user_id');
          done();
        });
    });
    after((done) => {
      User.deleteOne(user, (error) => {
        done();
      });
    });
  });

  // Testing create session
  describe('POST /login login()', () => {
    before((done) => {
      User.create(user, (error) => {
        done();
      });
    });
    after((done) => {
      User.deleteOne(user, (error) => {
        done();
      });
    });
    it('should create a jwt token and send token back to user', (done) => {
      chai
        .request(app)
        .post('/login')
        .send({ email: user.email, password: user.password })
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.should.have.property('user_id');
          done();
        });
    });
  });

  //Testing get endpoints
  describe('GET user', () => {
    let id = '';
    let token = '';
    beforeEach((done) => {
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
    afterEach((done) => {
      User.remove({ username: user.username }, (err) => {
        done();
      });
    });
    it('should get user by provided id as route param --> invalid id', (done) => {
      chai
        .request(app)
        .get(`/user/id/60bcedb29be86f8f0b160f75`)
        .set('user', token)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          assert.isAbove(
            res.body.message.length,
            0,
            'message should not be empty string'
          );
          expect(res.body.message).to.include('not');
          done();
        });
    });
    it('should get user by provided id as route param', (done) => {
      chai
        .request(app)
        .get(`/user/id/${id}`)
        .set('user', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('_id').eql(id);
          res.body.should.have.property('username').eql(user.username);
          res.body.should.have.property('firstName').eql(user.firstName);
          res.body.should.have.property('lastName').eql(user.lastName);
          res.body.should.have.property('email').eql(user.email);
          res.body.should.have.property('totalDocs').eql(0);
          res.body.should.have.property('totalFollowing').eql(0);
          res.body.should.have.property('totalFollower').eql(0);
          res.body.should.have.property('isFollowed').eql(false);
          done();
        });
    });
    it('should get user by provided username as route param --> username doesnot exist', (done) => {
      chai
        .request(app)
        .get(`/user/name/abcd`)
        .set('user', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('users').be.a('array');
          res.body.users.length.should.be.eql(0);
          res.body.should.have.property('totalUsers').eql(0);
          done();
        });
    });
    it('should get user by provided username as route param', (done) => {
      chai
        .request(app)
        .get(`/user/name/${user.username}`)
        .set('user', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('users').be.a('array');
          res.body.users.length.should.be.eql(1);
          res.body.should.have.property('totalUsers').eql(1);
          done();
        });
    });
    it('should get home feed of the user', (done) => {
      chai
        .request(app)
        .get('/home')
        .set('user', token)
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message');
          assert.isAbove(res.body.message.length, 0);
          res.body.should.have.property('length');
          res.body.should.have.property('totalPosts');
          done();
        });
    });
  });
});
