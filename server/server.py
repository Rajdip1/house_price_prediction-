from flask import Flask, request, jsonify
import util

app = Flask(__name__)

@app.route('/get_locations_name', methods=['GET'])
def get_locations_name():
    response = jsonify({
        'locations': util.get_locations_name()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route('/predict_home_price', methods=['GET','POST'])
def predict_home_price():
    total_sqft = request.form['total_sqft']
    location = request.form['location']
    bhk = request.form['bhk']
    bath = request.form['bath']
    
    response = jsonify({
        'estimated_price': util.get_estimated_price(location, total_sqft, bhk, bath)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')

    return response


if __name__ == "__main__":
    print("Starting Python Flask server for home price predictiono...")
    util.load_saved_artifacts()
    app.run(debug=True)