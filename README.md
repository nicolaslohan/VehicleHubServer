# VehicleHub Project

## Prerequisites
- Docker and Docker Compose
- Node.js (v20 or higher recommended)
- npm

## Setup

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd VEHICLEHUB PROJECT
   ```

2. **Configure environment variables**
   - Edit the `.env` file as needed. Example:
     ```env
     PORT=3333
     DATABASE_URL="postgresql://docker:docker@localhost:5432/vehiclehub"
     ```

3. **Start the database with Docker Compose**
   ```sh
   docker-compose up -d db
   ```

4. **Install dependencies**
   ```sh
   npm install
   ```

5. **Run the application**
   - For local development:
     ```sh
     npm run dev
     ```
   - Or with Docker Compose (API and DB):
     ```sh
     docker-compose up --build
     ```

6. **Test the API**
   - Use the `client.http` file with the REST Client extension in VS Code, or tools like Postman.

## Troubleshooting
- If you get database authentication errors, ensure your `.env` and `docker-compose.yaml` credentials match and the database container is running.
- For Drizzle Studio, use `localhost` as the DB host if running outside Docker.

---

Feel free to update this README with more details as your project evolves.
