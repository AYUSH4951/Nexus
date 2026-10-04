# Nexus - Network Security Phishing Detection System

An end-to-end Machine Learning and MLOps system that detects phishing URLs and malicious network traffic. The project features automated data ingestion from MongoDB Atlas, data validation and drift detection, missing-value imputation, hyperparameter search across multiple classification algorithms, experiment tracking with MLflow/DagsHub, a FastAPI prediction service, and full CI/CD deployment via Docker, GitHub Actions, and Render.

---

## Architecture Overview

```
                      +-----------------------------+
                      |   MongoDB Atlas Database    |
                      +--------------+--------------+
                                     |
                                     v
                       [ Data Ingestion Component ]
                                     |
                                     v
                       [ Data Validation Component ] (Drift Report)
                                     |
                                     v
                     [ Data Transformation Component ] (KNNImputer Pipeline)
                                     |
                                     v
                      [ Model Trainer Component ] (GridSearchCV Tuning)
                                     |
                                     v
                   +-----------------+-----------------+
                   |                                   |
                   v                                   v
          [ Artifacts Store ]                 [ final_model/ ]
          (model.pkl & preprocessor.pkl)       (model.pkl & preprocessor.pkl)
                   |                                   |
                   +-----------------+-----------------+
                                     |
                                     v
                      +-----------------------------+
                      |     FastAPI Web Service     |
                      |   (/docs, /train, /predict) |
                      +--------------+--------------+
                                     |
                                     v
             [ Docker Containerized on Render via GitHub Actions ]
```

---

## Project Structure

```text
ML_NETWORK_SECURITY/
├── .github/
│   └── workflows/
│       └── main.yml                   # GitHub Actions CI/CD pipeline
├── .dockerignore                       # Docker build context exclusions
├── .gitignore                          # Git ignore definitions
├── Dockerfile                          # Production container specification (Python 3.10)
├── README.md                           # Project documentation
├── render.yaml                         # Render Blueprint deployment configuration
├── requirements.txt                    # Project runtime dependencies
├── setup.py                            # Package distribution setup
│
├── app.py                              # FastAPI web service entry point
├── main.py                             # Local training pipeline entry point
├── push_data.py                        # ETL script to load raw CSV data into MongoDB
│
├── final_model/                        # Production model and preprocessor artifacts
│   ├── model.pkl                       # Trained classification model
│   └── preprocessor.pkl                # Data transformation Pipeline (KNNImputer)
│
├── valid_data/                         # Sample data for batch prediction & testing
│   └── test.csv
│
├── prediction_output/                  # Output directory for batch prediction results
│   ├── .gitkeep
│   └── output.csv
│
├── templates/                          # HTML templates for FastAPI UI
│   └── table.html                      # Predictions display table
│
├── tests/                              # Automated test suite
│   ├── __init__.py
│   └── test_pipeline.py                # Model loading, prediction & API validation tests
│
├── networksecurity/                    # Core Python package
│   ├── __init__.py
│   ├── components/                     # ML Pipeline components
│   │   ├── __init__.py
│   │   ├── data_ingestion.py           # MongoDB data extraction and train/test splitting
│   │   ├── data_validation.py          # Schema validation and dataset drift detection
│   │   ├── data_transformation.py      # Missing value imputation & feature processing
│   │   └── model_trainer.py            # GridSearchCV model training & evaluation
│   │
│   ├── constant/                       # Pipeline constants & configurations
│   │   ├── __init__.py
│   │   └── training_pipeline/          # Hyperparameter definitions, schema & paths
│   │
│   ├── entity/                         # Pipeline data structures
│   │   ├── __init__.py
│   │   ├── artifact_entity.py          # Output artifacts data classes
│   │   └── config_entity.py            # Input configuration data classes
│   │
│   ├── exception/                      # Custom exception handling
│   │   ├── __init__.py
│   │   └── exception.py                # NetworkSecurityException with line-level traceback
│   │
│   ├── logging/                        # Logging configuration
│   │   ├── __init__.py
│   │   └── logger.py                   # Formatted file-based logging
│   │
│   ├── pipeline/                       # End-to-end pipeline orchestrators
│   │   ├── __init__.py
│   │   ├── batch_prediction.py         # Batch prediction utility
│   │   └── training_pipeline.py        # Sequential pipeline runner
│   │
│   └── utils/                          # Common utility functions
│       ├── __init__.py
│       ├── main_utils/                 # YAML and pickle serialization utilities
│       └── ml_utils/                   # NetworkModel estimator & classification metrics
```

---

## Tech Stack

* **Language**: Python 3.10
* **Machine Learning**: `scikit-learn`, `numpy`, `pandas`, `dill`, `pickle`
* **MLOps & Tracking**: `MLflow`, `DagsHub`
* **Database**: `MongoDB Atlas`, `pymongo[srv]`, `dnspython`
* **Backend Web Framework**: `FastAPI`, `Uvicorn`, `Jinja2`
* **Containerization**: `Docker` (`python:3.10-slim-buster`)
* **CI/CD**: `GitHub Actions`
* **Cloud Deployment**: `Render` Web Services

---

## Getting Started

### 1. Prerequisites

* [Anaconda](https://www.anaconda.com/) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html)
* [Git](https://git-scm.com/)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (optional, for local container runs)
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 2. Clone and Setup Environment

```bash
# Clone the repository
git clone https://github.com/AYUSH4951/ML_NETWORK_SECURITY.git
cd ML_NETWORK_SECURITY

# Create and activate conda environment with Python 3.10
conda create -p venv python=3.10 -y
conda activate ./venv

# Install dependencies
pip install -r requirements.txt
```

### 3. Environment Variables Configuration

Create a `.env` file in the root directory:

```env
MONGO_DB_URL="mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?appName=Cluster0"
MONGODB_URL_KEY="mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?appName=Cluster0"
```

> **Note**: `MONGO_DB_URL` is used by the pipeline ETL & training components, and `MONGODB_URL_KEY` is used by the FastAPI web service in `app.py`.

---

## Running the Project

### Step 1: Push Raw Data to MongoDB (ETL)

To extract CSV data from `Network_Data/phisingData.csv` and insert it into your MongoDB database:

```bash
python push_data.py
```

### Step 2: Run the Training Pipeline

Execute the full data ingestion, validation, transformation, and hyperparameter tuning pipeline:

```bash
python main.py
```

Trained models and preprocessors will be automatically saved under:
* `Artifacts/<timestamp>/model_trainer/trained_model/model.pkl`
* `final_model/model.pkl` and `final_model/preprocessor.pkl`

### Step 3: Run the Automated Unit Tests

Run the test suite to validate artifact existence, deserialization, model inference, and API routing:

```bash
python -m unittest discover -s tests -p "test_*.py"
```

### Step 4: Run the FastAPI Web Application

Launch the web service locally:

```bash
python app.py
```

* **API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **Alternative Docs (Redoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Redirects to `/docs` (Swagger UI) |
| `GET` | `/docs` | Interactive Swagger API documentation |
| `GET` | `/train` | Triggers the complete training pipeline end-to-end |
| `POST` | `/predict` | Accepts an uploaded CSV file, computes predictions, and renders a table UI |

### Making a Batch Prediction via API

1. Open `http://localhost:8000/docs`.
2. Expand the `POST /predict` endpoint and click **Try it out**.
3. Upload `valid_data/test.csv`.
4. Click **Execute** to view predictions rendered in an HTML table.

---

## Docker & Local Container Execution

You can build and run the application locally inside a Docker container:

```bash
# Build the Docker image
docker build -t ml-network-security:latest .

# Run the container mapping port 8000
docker run -p 8000:8000 --env-file .env ml-network-security:latest
```

The service will be accessible at `http://localhost:8000`.

---

## CI/CD and Cloud Deployment

### GitHub Actions Workflow

On every Pull Request and Push to `main`:
1. **Continuous Integration**:
   * Checks out the code.
   * Sets up Python 3.10 with dependency caching.
   * Installs all dependencies from `requirements.txt`.
   * Executes unit and integration tests (`python -m unittest discover -s tests`).
2. **Docker Build Validation**:
   * Builds the Docker image via Buildx to guarantee image integrity.
3. **Render Deployment**:
   * Upon push/merge to `main`, optionally calls the Render Deploy Hook if `RENDER_DEPLOY_HOOK_URL` is set in GitHub Secrets.

### Deploying to Render

#### Option 1: Render Blueprints (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) → **New +** → **Blueprint**.
2. Select your repository.
3. Render automatically loads [`render.yaml`](file:///c:/Users/Ayush/Desktop/ML_NETWORK_SECURITY/render.yaml) and configures the web service on port `8000` with Docker runtime.
4. Set `MONGODB_URL_KEY` in the environment variables and click **Apply**.

#### Option 2: Manual Web Service
1. In Render, click **New +** → **Web Service** and connect your repository.
2. Select **Docker** as the runtime.
3. Add the following Environment Variables:
   * `PORT`: `8000`
   * `MONGODB_URL_KEY`: `<your-mongodb-connection-string>`
4. Click **Create Web Service**.
