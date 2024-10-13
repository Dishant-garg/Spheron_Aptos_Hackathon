from flask import Flask, request, jsonify
import requests
import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

app = Flask(__name__)

# This would be the route to generate the to-do list from Google Gemini Pro
@app.route('/get-todo', methods=['POST'])
def get_todo():
    try:
        # Get the input text from the request
        input_data = request.json.get('text', '')
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(input_data)

        todo_list = response.text
        return jsonify(todo_list), 200  # Return the to-do list in JSON format

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
