const supertest = require('supertest')
const app = require('../server/app.js')
const request = supertest(app)
const mongoose = require('mongoose')
const faker = require('faker')
const Review = require('../server/database/Review.js')
const helper = require('../server/database/helpers.js')
const dbName = 'endpointTest'

/*
  Note: this test file raises a warning if running the plain "jest" command. In order to avoid
  the warning, "jest --forceExit --detectOpenHandles" is required. For some reason, supertest is
  not closing its server connection after the tests are finished. Manually creating a connection
  and closing it in an afterAll() hook makes no difference; this is a well-documented issue online.
*/

var testReviews = [{
  userId: 'BigBird',
  itemId: 1,
  storeId: 0,
  createdAt: faker.date.past()
},
{
  userId: 'noodleManxD',
  itemId: 1,
  storeId: 0,
  createdAt: faker.date.past(),
  imageUrl: faker.image.imageUrl()
},
{
  userId: 'elmo',
  itemId: 2,
  storeId: 0,
  createdAt: faker.date.future(),
  imageUrl: faker.image.imageUrl()
}]

beforeAll(async () => {
  await mongoose.connection.close();
  await mongoose.connect(`mongodb://localhost/${dbName}`)
})

beforeEach(async () => {
  await Review.create(testReviews)
})

afterEach(async () => {
  await mongoose.connection.db.dropCollection('reviews')
})

afterAll(async () => {
  await mongoose.connection.db.dropDatabase()
  await mongoose.connection.close()
})

describe('API endpoints', () => {

  describe('Item reviews endpoint', () => {

    it('should respond to a request for item reviews', async () => {
      const res = await request.get('/api/item-reviews/1');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should use the getItem database helper to get reviews', async () => {
      const res = await request.get('/api/item-reviews/1');
      const reviews = await helper.getItem(1);

      expect(res.body.length).toBe(reviews.length);
      res.body.forEach((review, idx) => {
        expect(review.userId).toBe(reviews[idx].userId);
        expect(review.itemId).toBe(reviews[idx].itemId);
        expect(review.storeId).toBe(reviews[idx].storeId);
      });
    });
  });

  describe('Store reviews endpoint', () => {

    it('should respond to a request for store reviews', async () => {
      const res = await request.get('/api/store-reviews/1');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should use the getItem database helper to get reviews', async () => {
      const res = await request.get('/api/store-reviews/1');
      const reviews = await helper.getStore(0);

      expect(res.body.length).toBe(reviews.length);
      res.body.forEach((review, idx) => {
        expect(review.userId).toBe(reviews[idx].userId);
        expect(review.itemId).toBe(reviews[idx].itemId);
        expect(review.storeId).toBe(reviews[idx].storeId);
      });
    });
  });

  describe('Photo reviews endpoint', () => {

    it('should respond to a request for photo reviews', async () => {
      const res = await request.get('/api/photo-reviews/1');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should use the getItem database helper to get reviews', async () => {
      const res = await request.get('/api/photo-reviews/1');
      const reviews = await helper.getPhoto(1, 0);

      expect(res.body.length).toBe(reviews.length);
      res.body.forEach((review, idx) => {
        expect(review.userId).toBe(reviews[idx].userId);
        expect(review.itemId).toBe(reviews[idx].itemId);
        expect(review.storeId).toBe(reviews[idx].storeId);
      });
    });
  });

})
