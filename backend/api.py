import base64
import re
from flask import Flask, request
import psycopg2
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv('gemini_key'))

db_config = {
    'host': os.getenv('db_host'),
    'port': os.getenv('db_port'),
    'database': os.getenv('db_name'),
    'user': os.getenv('db_user'),
    'password': os.getenv('db_pass')
}

app = Flask(__name__)

@app.route("/", methods=["POST"])
def evaluate_keyframe():
    sign_name = request.form.get('signName')
    frame_number_str = request.form.get('frameNumber')
    image_base64 = request.form.get('imageBase64')

    if not sign_name:
        return "Missing required parameter: 'signName'.", 400
    if not frame_number_str:
        return "Missing required parameter: 'frameNumber'.", 400
    if not image_base64:
        return "Missing required parameter: 'imageBase64'.", 400

    try:
        frame_number = int(frame_number_str)
    except ValueError:
        return "'frameNumber' must be an integer.", 400

    try:
        base64_data = re.sub('^data:image/.+;base64,', '', image_base64)
        image_data = base64.b64decode(base64_data)

        filepath = f"./images/{sign_name}_{frame_number}.jpg"
        with open(filepath, "wb") as f:
            f.write(image_data)
    except Exception as e:
        print(f"Base64 decoding error: {e}")
        return "Failed to decode or save the image.", 400

    conn = None
    sign_details = None
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()

        sql = """
            SELECT handShapeDescription, locationDescription, orientationDescription, facialExpressionDescription
            FROM sign_data
            WHERE signName = %s AND frameNumber = %s;
        """
        cursor.execute(sql, (sign_name, frame_number))
        sign_details = cursor.fetchone()

        cursor.close()
    except (Exception, psycopg2.Error) as e:
        print(f"Database error: {e}")
        return "Database access error.", 500
    finally:
        if conn:
            conn.close()

    if not sign_details:
        return f"No sign details found for '{sign_name}' at frame {frame_number}.", 404

    my_file = None
    response_text = None
    try:
        my_file = client.files.upload(file=filepath)

        prompt = f"""
You are provided with a single keyframe image showing a sign language learner's hand and body position while they attempt to perform the sign '{sign_name}'. Carefully analyze the image according to the evaluation guide below, and provide clear, detailed feedback for each category. Address the learner directly in a single paragraph, referencing the evaluation criteria naturally without mentioning the guide or this prompt. Begin immediately with the feedback — do not preface your response. If the learner’s sign appears incorrect or not recognizable as the intended sign, this is a critical issue that you must explicitly point out. Conclude with an overall assessment of their performance at the end of the paragraph, where you must determine if the correct sign was performed accurately.

Evaluation Guide for {sign_name} (Frame {frame_number}):
Handshape: {sign_details[0]}
Location: {sign_details[1]}
Palm Orientation: {sign_details[2]}
Facial Expression/Non-Manual Signals (NMS): {sign_details[3]}
"""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[my_file, prompt],
        )
        response_text = response.text

    except Exception as e:
        print(f"Image processing error: {e}")
        return "Image processing or evaluation error.", 500
    finally:
        if my_file:
            try:
                client.files.delete(name=my_file.name)
            except Exception as del_e:
                print(f"Warning: Failed to delete uploaded file: {del_e}")

    if response_text:
        return response_text
    else:
        return "Unexpected error during evaluation.", 500

@app.route("/signs", methods=["GET"])
def get_signs():
    conn = None
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()

        sql = """
            SELECT signName, COUNT(*) as entryCount
            FROM sign_data
            GROUP BY signName
            ORDER BY signName ASC;
        """
        cursor.execute(sql)
        results = cursor.fetchall()

        sign_list = [{"signName": row[0], "entryCount": row[1]} for row in results]

        cursor.close()
        return {"signs": sign_list}, 200

    except (Exception, psycopg2.Error) as e:
        print(f"Database error: {e}")
        return "Database access error.", 500
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    app.run(debug=True)
