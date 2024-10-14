# Currency Converter API

This is a NestJS application that provides a currency conversion service using exchange rates from the Monobank API. It includes caching with Redis to improve performance by storing exchange rates for a configurable duration

### Features
- Currency conversion between any supported currencies.
- Fetches exchange rates from the Monobank API.
- Caches exchange rates using Redis to reduce API calls and improve performance.
- Swagger UI for API testing and documentation.
- Dockerized for easy setup and deployment.

### App structure
```
currency-converter/
│
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── currency/
│   │   ├── currency.controller.ts
│   │   ├── currency.controller.spec.ts
│   │   ├── currency.service.ts
│   │   ├── currency.service.spec.ts
│   │   ├── dto/
│   │   │   ├── convert-currency.dto.ts
│   ├── common/
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
├── Dockerfile
├── docker-compose.yml
├── package.json
├── jest.config.js
├── .env
├── README.md
```

### Getting Started

1. Set Up Environment Variables
    ```
    cp .env.test .env
    ```

2. Build and Run the Application with Docker

    The project includes a Dockerfile and docker-compose.yml for easy containerization. To build and run the application, simply use:
    ```
    docker-compose up --build
    ```
    This will start two services:
    - app: The NestJS API running on port 3000.
    - redis: The Redis instance used for caching, running on port 6379.
3. Access the Application

    Once the containers are up and running, you can access the following:

    - API: http://localhost:3000
    - Swagger UI (API documentation and testing): http://localhost:3000/api
4.  Example API Request

    You can test the currency conversion by sending a POST request to the ```/currency/convert``` endpoint. Use Swagger UI or any HTTP client like Postman or cURL.

    Endpoint: ```/currency/convert```
    Method: ```POST```

    Request Body:
    ```
    {
    "from": 840,  // Source currency code (e.g., USD)
    "to": 980,    // Target currency code (e.g., UAH)
    "amount": 100 // Amount to convert
    }
    ```
    Response Example:
    ```
    {
    "convertedAmount": 4148.5199999999995
    }
    ```

### Running Tests

 To run the tests, use the following command:
    ```
    npm run test
    ```
You can also run tests in watch mode or with a coverage report:
    - Watch mode: ```npm run test:watch```
    - Coverage: ```npm run test:cov```

### Troubleshooting

- If you encounter issues with Redis or the app, try restarting the containers:
    ```
    docker-compose down
    docker-compose up --build
    ```
- If you need to clear the Redis cache, restart the Redis container:
    ```
    docker-compose restart redis
    ```