import sys
sys.path.insert(0, r'c:\Users\yashw\OneDrive\Desktop\New folder')

# Import the app
from netlimiter import app

# List all routes
print("Registered routes:")
for rule in app.url_map.iter_rules():
    print(f"  {rule.endpoint}: {rule.rule}")
