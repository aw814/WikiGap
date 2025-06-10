import json
import pandas as pd

TOPIC = "Injera"
# Load the JSON file
with open(f'{TOPIC}.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Access the 'languages' part
languages = data[TOPIC]['languages']

# Prepare the result
counts = []

for lang_code, lang_data in languages.items():
    total_entries = 0
    for header_name, header_content in lang_data.get('headers', {}).items():
        entries = header_content.get('entries', [])
        total_entries += len(entries)
    counts.append({'Language': lang_code, 'Total Entries': total_entries})

# Convert to a DataFrame for nicer display
summary_df = pd.DataFrame(counts)
print(TOPIC)
print(summary_df)