import base64
import re
from flask import Flask, request
import psycopg2
from google import genai
import os
from dotenv import load_dotenv
from flask_cors import CORS, cross_origin

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

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/evaluate", methods=["POST"])
@cross_origin()
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
Do not preface your response.

First, verify if the image shows a person plausibly attempting sign language and briefly describe its content. If not (i.e. if there are no hands), state it's unsuitable for feedback because it doesn't depict a relevant sign attempt, and stop.

If suitable, address the learner directly in one paragraph. Focusing only on this single keyframe and not the entire sign's movement, evaluate their performance based on the evaluation guide below. Reference details about their handshape, location, palm orientation, and non-manual signals naturally into your critique, without mentioning the guide or its categories. Conclude by assessing how accurately this specific frame matches the guide's information about '{sign_name}' and how recognizable it is as part of that sign (whether a person who knows sign language would be able to recognize it).

Evaluation guide for current keyframe in {sign_name}:
Handshape: {sign_details[0]}
Location: {sign_details[1]}
Palm Orientation: {sign_details[2]}
Non-Manual Signals: {sign_details[3]}
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
@cross_origin()
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

@app.route("/explain", methods=["GET"])
@cross_origin()
def generate_instruction():
    sign_name = request.args.get('signName')

    if not sign_name:
        print("Instruction request missing 'signName' query parameter.")
        return "Missing required query parameter: 'signName'.", 400

    conn = None
    keyframes_data = []
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        sql = """
            SELECT frameNumber, handShapeDescription, locationDescription, orientationDescription, facialExpressionDescription
            FROM sign_data
            WHERE signName = %s
            ORDER BY frameNumber ASC;
        """
        cursor.execute(sql, (sign_name,))
        results = cursor.fetchall()
        cursor.close()

        if not results:
            print(f"No keyframes found for sign during instruction generation: '{sign_name}'")
            return f"No keyframes found for sign '{sign_name}'.", 404

        for row in results:
            keyframes_data.append({
                "frame": row[0],
                "handshape": row[1],
                "location": row[2],
                "orientation": row[3],
                "nms": row[4]
            })

    except (Exception, psycopg2.Error) as e:
        print(f"Database error while fetching keyframes for instruction generation ('{sign_name}'): {e}")
        return "Database access error.", 500
    finally:
        if conn:
            conn.close()

    instruction_prompt = f"Generate clear and concise step-by-step instructions for a beginner learning to perform the American Sign Language (ASL) sign '{sign_name}'. Use the following keyframe details. Address the learner directly (using 'you'). Describe the handshape, location, palm orientation, and any necessary movement between keyframes. Mention facial expressions or non-manual signals if specified. Focus on clarity and avoid jargon (e.g. 'B' handshape, 'Y' handshape). Do not include any introductory sentence like 'Here are the instructions...' - start directly with the instructions for the sign.\n\n"

    if len(keyframes_data) == 1:
        frame = keyframes_data[0]
        instruction_prompt += f"This sign has one primary position (Frame {frame['frame']}):\n"
        instruction_prompt += f"- Handshape: {frame['handshape']}\n"
        instruction_prompt += f"- Location (where to place your hand): {frame['location']}\n"
        instruction_prompt += f"- Palm Orientation: {frame['orientation']}\n"
        instruction_prompt += f"- Facial Expression/NMS: {frame['nms']}\n\n"
        instruction_prompt += "Explain how to form and hold this single position clearly."
    else:
        instruction_prompt += f"This sign involves {len(keyframes_data)} key steps (frames). Follow these steps in order:\n\n"
        for frame in keyframes_data:
            instruction_prompt += f"Step {frame['frame']} (Frame {frame['frame']}):\n"
            instruction_prompt += f"- Form Handshape: {frame['handshape']}\n"
            instruction_prompt += f"- Position Hand At: {frame['location']}\n"
            instruction_prompt += f"- Palm Orientation: {frame['orientation']}\n"
            instruction_prompt += f"- Facial Expression/NMS: {frame['nms']}\n\n"
        instruction_prompt += "Explain how to start with the first step (frame), describe the movement needed to transition smoothly to the next step(s), and how to conclude the sign. Make the transitions clear."

    response_text = None
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[instruction_prompt],
        )
        response_text = response.text

    except Exception as e:
        print(f"Gemini instruction synthesis API error for '{sign_name}': {e}")
        return "AI instruction generation error.", 500

    return response_text, 200

if __name__ == "__main__":
    app.run(debug=True)
