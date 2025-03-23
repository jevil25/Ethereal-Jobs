import json
import os

file_path = os.path.join(os.path.dirname(__file__), "index.json")

def read_or_make_json(max_length):
    # Check if the file exists
    if os.path.exists(file_path):
        # Read the JSON file
        with open(file_path, 'r') as file:
            data = json.load(file)
    else:
        # Create a new JSON file with index 0
        data = {"index": 0}
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)
    
    # Increment the index
    current_index = data["index"]
    data["index"] = current_index + 1

    # Write the updated index back to the file
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)
    
    return current_index % max_length
