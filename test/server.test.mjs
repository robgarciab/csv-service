import { expect } from 'chai';
import supertest from 'supertest';
import path from 'path';
import { fileURLToPath } from 'url';
import server from '../server.js';

const request = supertest(server);

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CSV Service', () => {
    // Ensure the server is closed after all tests are complete
    after(() => {
        server.close(() => {
            console.log('Server closed after tests.');
        });
    });

    it('should upload and parse a CSV file', (done) => {
        request
            .post('/upload')
            .attach('file', path.join(__dirname, 'test_files', 'test.csv'))
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.message).to.equal('File test.csv uploaded and parsed successfully.');
                done();
            });
    });

    it('should retrieve the next set of records as a CSV file', (done) => {
        request
            .get('/splitedfile?filename=test.csv&n=2')
            .expect('Content-Type', /text\/csv/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.header['content-type']).to.equal('text/csv; charset=utf-8');
                done();
            });
    });

    it('should return a 404 error if the file is not found', (done) => {
        request
            .get('/splitedfile?filename=nonexistent.csv&n=2')
            .expect(404)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body.error).to.equal('File not found.');
                done();
            });
    });
});