// ********************** Initialize server **********************************


const server = require('../src/index.js'); //TODO: Make sure the path to your index.js is correctly added


// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;


// *********************** TODO: WRITE 2 UNIT TEST CASES **************************
//We are checking POST /add_user API by passing the user info in in incorrect manner (name cannot be an integer). This test case should pass and return a status 400 along with a "Invalid input" message.

describe('Testing Add User API', () => {
    it('positive: /register testing for successful regestration', done => {
        chai
        .request(server)
        .post('/register')
        .send({username: 'John Doe', password: 'password'})
        .end((err, res) => {
          res.should.have.status(200);
          res.should.redirectTo(/^.*127\.0\.0\.1.*\/homeCanvas$/);
            done();
          });
    })
  
    
    it('Negative : /register. Checking invalid username', done => {
      chai
        .request(server)
        .post('/register')
        .send({username: ' ', password: 'password'})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
});
// ********************************************************************************


// *********************** UNIT TEST CASE FOR Login **************************
describe('Testing Login', () => {
  it('positive: /login checking for successful login', done => {
      chai
      .request(server)
      .post('/login')
      .send({username: 'admin', password: 'admin'})
      .end((err, res) => {
          res.should.have.status(200);
          res.should.redirectTo(/^.*127\.0\.0\.1.*\/homeCanvas$/);

          done();
        });
  })

  it('Negative : /login. Checking for valid username but invalid password', done => {
    chai
      .request(server)
      .post('/login')
      .send({username: 'admin', password: 'password'})
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
});

// ********************************************************************************