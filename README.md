# CSV Service API

This project is a Dockerized Node.js service that provides a flexible API for uploading, processing, and retrieving CSV data in chunks. Designed for scalability and efficiency, the service is ideal for applications that need to handle large CSV files by processing them in smaller, manageable parts.

## Features

- **Chunked Data Retrieval**: Efficiently retrieves data from large CSV files in chunks, minimizing memory usage.
- **Automatic Reset**: Automatically resets the data index after a specified period of inactivity (default: 5 minutes), configurable via environment variables.
- **CSV Upload**: Supports CSV file uploads with automatic parsing and chunked processing.
- **Dockerized**: Fully containerized for easy deployment on any platform that supports Docker, with multi-architecture support (`amd64` and `arm64`).
- **Configurable**: Customize the reset time and other parameters through environment variables when running the container.

## Usage

### Running the Service

1. **Docker**: The service is fully containerized and can be run using Docker. This command will start the service with a reset time of 30 seconds:

   ```bash
   docker run -d -p 3000:3000 -e RESET_TIME_MS=30000 robgarciab/csv-service:latest
    ```

2. **API** Endpoints:
   - Upload CSV: POST /upload
   - Retrieve Chunked Data: GET /splitedfile?filename=yourfile.csv&n=20

### Deployment

The service is built with cloud deployment in mind, allowing you to run it on any cloud provider that supports Docker containers.

### Installation

For local development, clone the repository and install dependencies:
    
```bash
npm install
```

### Running Locally

You can run the service locally using Node.js:

```bash
npm start
```

Or build and run it with Docker:

```bash
docker build -t csv-service .
docker run -p 3000:3000 csv-service
```

### Testing

Automated tests are included and can be run using:

```bash
npm test
```

### Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your ideas.

### License

This project is licensed under the MIT License.