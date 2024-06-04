import requests
import json

# Sample Data
data = {
    "collection_date": "WED 15.5.24",
    "collection_time": "10.30-11am",
    "collection_ref": "PO-0047",
    "delivery_date": "WED 15.5.24",
    "delivery_time": "2PM-3PM",
    "delivery_ref": "PO047",
    "deliveries": [
        {"item": "MAHOU/30L", "quantity_collected": 24, "quantity_delivered": 24},
        {"item": "STELLA ARTOIS/10G", "quantity_collected": 216, "quantity_delivered": 216},
        {"item": "BUDWEISER/11G", "quantity_collected": 40, "quantity_delivered": 40},
        {"item": "BUD.LIGHT/11G", "quantity_collected": 48, "quantity_delivered": 48},
        {"item": "CAMDEN.HELLS/30L", "quantity_collected": 16, "quantity_delivered": 16},
        {"item": "CAMDEN.PALE/30L", "quantity_collected": 16, "quantity_delivered": 16},
        {"item": "CAMDEN.HELLS/50L", "quantity_collected": 48, "quantity_delivered": 48}
    ]
}

# Read the template file
with open(r'C:\Users\JudeStokes\Downloads\gleisure-login-page\gleisure-login-page\server\backend-components\template.html', 'r') as file:
    template = file.read()

# Carbone API endpoint
url = 'https://render.carbone.io/render'

# Carbone API key
api_key = 'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI4MTIwMjg4NjAxMjgxNjc0MDIiLCJhdWQiOiJjYXJib25lIiwiZXhwIjoyMzY4NTE4NDkxLCJkYXRhIjp7InR5cGUiOiJwcm9kIn19.ATNxbXaNdghEpogUBi13gdo9ONsersxRW9fTKRdRGmV8PcHXTr8Hfxv6TtRWbyrl48qt51Sbx4I9VecjypglrBgbAGdc6ufoib-NLcFMS5N0_8PlquFdgti3klDfi1cYexuUJKmP8E-oRzuzqr2zBF3507b90o_Ln3jFP60lhxrBxopw'  # Replace with your actual API key

# Prepare the payload
payload = {
    "template": template,
    "data": data,
    "convertTo": "pdf"
}

# Headers
headers = {
    'Content-Type': 'application/json',
    'carbone-version': '4',
    'Authorization': f'Bearer {api_key}'
}

# Send the request to the Carbone API
response = requests.post(url, headers=headers, data=json.dumps(payload))

# Check the response
if response.status_code == 200:
    # Save the generated PDF to a file
    with open('output.pdf', 'wb') as f:
        f.write(response.content)
    print('PDF generated successfully.')
else:
    print(f'Error generating PDF: {response.status_code} - {response.text}')
