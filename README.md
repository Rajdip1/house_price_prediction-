# Bangalore House Price Prediction
  •	Built a regression model using EDA, feature engineering, and algorithm comparison to predict Bangalore housing prices.
  	Achieved 74.46% model accuracy after hyperparameter tuning (GridSearchCV) and exported the final trained model for inference.

<img width="1899" height="831" alt="Screenshot 2025-11-18 130125" src="https://github.com/user-attachments/assets/fa5075ae-9453-4479-83fa-e5def3dbaed7" />
<img width="1919" height="1007" alt="Screenshot 2025-11-18 130226" src="https://github.com/user-attachments/assets/842044d3-2190-45d8-9680-e3b4c3a121f7" />
<img width="1895" height="827" alt="Screenshot 2025-11-18 130204" src="https://github.com/user-attachments/assets/407ce30d-0d70-41fe-93aa-53bb4cfd74a1" />


## Project structure

- `client/` - static frontend (HTML, JS, CSS). The UI loads available locations and calls the backend to get an estimated price.
  - `app.html` - the single-page UI
  - `app.js` - UI logic and AJAX calls
  - `app.css` - styles
- `server/` - Flask backend and helpers
  - `server.py` - Flask app exposing endpoints
  - `util.py` - loads artifacts and performs predictions
  - `artifacts/` - trained model and artifacts used at runtime
    - `home_price_model.pickle` (model binary — required to run predictions)
    - `columns.json` (feature/column names used by the model)
- `model/` - training resources and notebook
  - `bengaluru_house_prices.csv` - dataset used for building the model
  - `columns.json` - same structure as `server/artifacts/columns.json`
  - `house_price_predictions.ipynb` - notebook for data exploration / training

## Quick overview

- Backend endpoints (in `server/server.py`)
  - `GET /get_locations_name` — returns a JSON object with available `locations` (the model's one-hot location columns).
  - `POST /predict_home_price` — accepts form data fields `total_sqft`, `bhk`, `bath`, `location` and returns `{ "estimated_price": <value> }` (price is returned in Lakhs, as the frontend displays `Lakh`).

- Frontend (`client/app.js`) loads locations on page load and posts selected values to the prediction endpoint. Note: the frontend uses jQuery and makes AJAX calls to `/api/get_locations_name` and `/api/predict_home_price` by default — see "Running the app" below for how to wire this up.

## Prerequisites

- Python 3.8+ (tested with 3.8–3.11)
- pip
- (Optional) virtual environment support

Python packages required at runtime (backend):

- Flask
- numpy
- scikit-learn (the pickled model likely depends on sklearn)

Suggested quick install (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install flask numpy scikit-learn
```

If you'd like, create a `requirements.txt` with the packages above.

## How to run (recommended)

There are two straightforward ways to run and use the frontend with the backend. The backend already adds CORS headers (`Access-Control-Allow-Origin: *`) so the frontend can be served from a different host/port.

Option A — run Flask backend and open the frontend directly (easy test)

1. Start the backend (this will load the model artifacts):

```powershell
python server\server.py
```

2. Serve the frontend files or open `client\app.html` in your browser.

Notes:
- If you open the HTML file directly as `file://` the browser may restrict AJAX; it's easier to serve the `client` folder via a tiny static server, for example:

```powershell
# from repository root
python -m http.server 8000 -d client
# open http://127.0.0.1:8000/app.html in your browser
```

- By default `client/app.js` calls `/api/get_locations_name` and `/api/predict_home_price`. If you use the simple static server above and Flask on `http://127.0.0.1:5000`, either:
  - Edit `client/app.js` to use `http://127.0.0.1:5000/get_locations_name` and `http://127.0.0.1:5000/predict_home_price` (remove the `/api/` prefix), or
  - Keep the URLs and configure a proxy (or an HTTP server that proxies `/api` to your Flask backend).

Because the Flask server sets `Access-Control-Allow-Origin: *`, you can keep the original AJAX endpoints and make requests cross-origin from the static server.

Option B — serve the frontend from Flask (single host)

You can also configure Flask to serve the `client` folder as static files (for example by using `Flask(__name__, static_folder='../client')` or by creating routes that serve `client/app.html`). This avoids cross-origin issues and keeps client/backend on the same origin. This requires small changes to `server/server.py` (not made here).

## API usage

1) Get locations

Request:

- Method: GET
- URL: `/get_locations_name` (or `/api/get_locations_name` if proxied)

Response example:

```json
{ "locations": ["1st phase jp nagar", "koramangala", ...] }
```

2) Predict price

Request:

- Method: POST
- URL: `/predict_home_price` (or `/api/predict_home_price` if proxied)
- Body: form data
  - `total_sqft` — numeric
  - `bhk` — integer
  - `bath` — integer
  - `location` — string (should match one of the returned locations)

Response example:

```json
{ "estimated_price": 85.32 }
```

The backend will return a float; the frontend app displays it as `Lakh`.

## Model artifacts and notebook

- Artifacts used at runtime: `server/artifacts/home_price_model.pickle` and `server/artifacts/columns.json`.
- Training/EDA notebook: `model/house_price_predictions.ipynb` — contains data cleaning, feature engineering and model training steps used to prepare the `home_price_model.pickle` artifact.
- Dataset: `model/bengaluru_house_prices.csv` (raw data used for modeling).

## Troubleshooting

- If you see `FileNotFoundError` when `server.util` attempts to open `server/artifacts/home_price_model.pickle`, confirm the file is present in `server/artifacts/`.
- If prediction errors mention missing sklearn attributes on unpickling, make sure `scikit-learn` of a compatible version is installed.
- If the frontend fails to load locations or prediction requests fail, check browser console and network panel. If the frontend is served from a different port than Flask, CORS is allowed by the server but check the request URLs — client may be trying `/api/...` while Flask exposes endpoints without `/api`.

## Notes for maintainers / next steps

- Consider adding a `requirements.txt` and a simple `run.sh` / `run.ps1` convenience script.
- Consider serving the client from Flask (or add a small webpack / dev server) so no manual URL edits are needed.
- Add unit tests for `util.get_estimated_price` and contract tests for the API endpoints.



