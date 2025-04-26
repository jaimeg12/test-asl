from google import genai
import config
from flask import Flask, request

client = genai.Client(api_key=config.gemini_key)

app = Flask(__name__)

@app.route("/", methods=["POST"])
def handle_image():
    if 'image' not in request.files:
        return "no image", 400

    file = request.files['image']

    if file.filename == '':
        return "no filename", 400

    filepath = f"./{file.filename}"
    file.save(filepath)

    my_file = client.files.upload(file=filepath)

    prompt = (
        "You are provided with a single keyframe image showing a sign language learner's hand and body position. Carefully analyze the image according to the evaluation guide below and provide clear, detailed feedback for each category. Address the learner directly in a single paragraph, identifying details in the evaluation guide while remembering that the learner does not see the guide or this prompt. Do not preface your evaluation; begin immediately with the feedback. Conclude with an overall assessment of their performance at the end of the paragraph.\n"
        "Handshape: The handshape is a B-handshape (also sometimes called a Flat Hand). The fingers are extended and held together, and the thumb is held alongside the palm/index finger.\n"
        "Location: The sign is made at the center of the chest.\n"
        "Palm Orientation: The palm is oriented inward, towards the signer's body.\n"
        "Facial Expression/Non-Manual Signals (NMS): The signer has a pleasant, smiling facial expression and is looking forward."
    )

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[my_file, prompt],
    )

    return response.text

if __name__ == "__main__":
    app.run(debug=True)
