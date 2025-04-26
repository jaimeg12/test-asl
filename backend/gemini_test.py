from google import genai
import config

client = genai.Client(api_key=config.gemini_key)

my_file = client.files.upload(file="images/my-in-sign-language.jpg")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=[my_file, "You are provided with a single keyframe image captured from a sign language learner’s motion. Evaluate this keyframe according to each of the categories in the following guide, then provide feedback to the user:\nHandshape: The handshape is a B-handshape (also sometimes called a Flat Hand). The fingers are extended and held together, and the thumb is held alongside the palm/index finger.\nLocation: The sign is made at the center of the chest.\nPalm Orientation: The palm is oriented inward, towards the signer's body.\nFacial Expression/Non-Manual Signals (NMS): The signer has a pleasant, smiling facial expression and is looking forward. This generally conveys a positive or neutral emotion."],
)

print(response.text)
