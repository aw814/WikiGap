import pandas as pd
import json
import argparse
import os
import glob


def safe_value(value):
    """ Convert NaN to None (null in JSON) """
    return None if pd.isna(value) else value


#  Function to Convert DataFrame to Nested JSON Supporting Multiple Persons and Languages
def df_to_nested_json(df):
    nested_dict = {}

    for _, row in df.iterrows():
        person = row['person_name']
        language = row['language']
        header_1 = row['header_1'] if pd.notna(row['header_1']) else "General description"

        # Ensure structure
        nested_dict.setdefault(person, {}).setdefault('languages', {}).setdefault(language, {}).setdefault('headers', {}).setdefault(header_1, {'entries': []})

        # Append entry with NaN replaced by None
        nested_dict[person]['languages'][language]['headers'][header_1]['entries'].append({
            'header_2': {
                'original': safe_value(row['header_2']),
                'translated': safe_value(row['header_2_translated'])
            },
            'header_1': {
                'original': header_1,
                'translated': safe_value(row['header_1_translated'])
            },
            'fact': {
                'original': safe_value(row['fact']),
                'translated': safe_value(row['fact_translated'])
            },
            'src_context': safe_value(row['src_context'])
        })


    return nested_dict

def main(topic):
    """
    Reads the input CSV, processes it into nested JSON, and saves it.
    """
    output_json = f"./{topic}.json"
    # Read CSV file
    directory = f"../csv"
    # Find all matching CSV files in the directory
    file_pattern = os.path.join(directory, f"{topic}_*.csv")
    csv_files = glob.glob(file_pattern)

    if not csv_files:
        print(f"No files found for topic '{topic}' in directory '{directory}'.")
        return None

    # Read and concatenate all CSV files
    dataframes = [pd.read_csv(file) for file in csv_files]
    df = pd.concat(dataframes, ignore_index=True)
    # Convert DataFrame to JSON
    nested_json = df_to_nested_json(df)

    # Save to JSON file
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(nested_json, f, indent=4, ensure_ascii=False)

    print(f"JSON file saved successfully: {output_json}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert a CSV file to a nested JSON structure for a web application.")
    parser.add_argument("topic", help="topic_en")
    
    args = parser.parse_args()
    main(args.topic)