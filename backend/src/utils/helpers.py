from datetime import date, datetime
import json
import os
import string

class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder for handling date and datetime objects."""
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return super().default(obj)

def serialize_dates(obj):
    """Recursively serialize datetime objects in nested structures."""
    match obj:
        case date() | datetime():
            return obj.isoformat()
        case dict():
            return {k: serialize_dates(v) for k, v in obj.items()}
        case list():
            return [serialize_dates(i) for i in obj]
        case _:
            return obj

def get_templates(template_name: str) -> string.Template:
    template_path: str = os.path.join(
        os.getcwd(),
        "src/templates",
        template_name,
    )
    with open(template_path, "r", encoding="utf-8") as file:
        return string.Template(file.read())
        
