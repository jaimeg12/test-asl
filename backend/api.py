from google import genai
import config
from flask import Flask, request
import psycopg2

client = genai.Client(api_key=config.gemini_key)

db_config = {
    'host': 'localhost',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'pass'
}

app = Flask(__name__)

@app.route("/", methods=["POST"])
def evaluate_keyframe():
    sign_name = request.form.get('signName')
    frame_number_str = request.form.get('frameNumber')

    if not sign_name:
        return "missing signName in params", 400
    if not frame_number_str:
        return "missing frameNumber in params", 400

    try:
        frame_number = int(frame_number_str)
    except ValueError:
        return "frameNumber not int", 400

    if 'image' not in request.files:
        return "missing image in params", 400

    file = request.files['image']

    if file.filename == '':
        return "missing filename in image", 400

    filepath = f"./images/{file.filename}"

    try:
        file.save(filepath)
    except Exception as e:
        print(f"File save error: {e}")
        return "file save error", 500

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
        return "database error", 500
    finally:
        if conn is not None:
            conn.close()

    if not sign_details:
        return f"Sign details not found for sign '{sign_name}' frame {frame_number}", 404

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
        return "image processing error", 500
    finally:
        if my_file:
            try:
                client.files.delete(name=my_file.name)
            except Exception as del_e:
                print(f"Warning: Failed to delete GenAI file {my_file.name}: {del_e}")

    if response_text is not None:
         return response_text
    else:
         print("Error: Reached end of function without valid response or error return.")
         return "internal processing error", 500

if __name__ == "__main__":
    app.run(debug=True)
