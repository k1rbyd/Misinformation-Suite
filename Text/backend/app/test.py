from dotenv import load_dotenv
import os

load_dotenv()
print("🔑 Loaded GOOGLE_API_KEY:", os.getenv("GOOGLE_API_KEY"))
