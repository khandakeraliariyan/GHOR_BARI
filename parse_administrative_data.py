import json

# Read all JSON files
with open(r'client/public/divisions.json', 'r', encoding='utf-8') as f:
    divisions_data = json.load(f)

with open(r'client/public/districts.json', 'r', encoding='utf-8') as f:
    districts_data = json.load(f)

with open(r'client/public/upzillas.json', 'r', encoding='utf-8') as f:
    upzillas_data = json.load(f)

with open(r'client/public/thanas.json', 'r', encoding='utf-8') as f:
    thanas_data = json.load(f)

# Create the consolidated structure
result = {
    "divisions": [],
    "districts": [],
    "upazilas": [],
    "thanas": []
}

# Add divisions
for div in divisions_data:
    result["divisions"].append({
        "id": div["id"],
        "name": div["name"],
        "bn_name": div["bn_name"],
        "division_number": int(div["id"])
    })

# Add districts with division mapping
for dist in districts_data:
    result["districts"].append({
        "id": dist["id"],
        "division_id": dist["division_id"],
        "name": dist["name"],
        "bn_name": dist["bn_name"],
        "district_number": int(dist["id"])
    })

# Add upazilas
for upazila in upzillas_data:
    result["upazilas"].append({
        "id": upazila["id"],
        "district_id": upazila["district_id"],
        "name": upazila["name"],
        "bn_name": upazila["bn_name"],
        "type": "upazila"
    })

# Add thanas
for thana in thanas_data:
    result["thanas"].append({
        "id": thana["id"],
        "district_id": thana["district_id"],
        "name": thana["name"],
        "bn_name": thana["bn_name"],
        "type": "thana"
    })

# Print statistics
print(f"✓ Divisions: {len(result['divisions'])}")
print(f"✓ Districts: {len(result['districts'])}")
print(f"✓ Upazilas: {len(result['upazilas'])}")
print(f"✓ Thanas: {len(result['thanas'])}")

# Verify hierarchy
print("\n=== Hierarchy Verification ===")
print("Divisions by ID:")
for div in result['divisions']:
    print(f"  {div['id']}: {div['name']} ({div['bn_name']})")

print(f"\nDistricts by Division:")
for div_id in range(1, 9):
    districts_in_div = [d for d in result['districts'] if d['division_id'] == str(div_id)]
    print(f"  Division {div_id}: {len(districts_in_div)} districts")

print(f"\nUpazilas by District (sample):")
for dist_id in range(1, 4):
    upazilas_in_dist = [u for u in result['upazilas'] if u['district_id'] == str(dist_id)]
    print(f"  District {dist_id}: {len(upazilas_in_dist)} upazilas")

print(f"\nThanas by District (sample):")
for dist_id in range(1, 4):
    thanas_in_dist = [t for t in result['thanas'] if t['district_id'] == str(dist_id)]
    print(f"  District {dist_id}: {len(thanas_in_dist)} thanas")

# Save as JavaScript object
js_output = "// Bangladesh Administrative Hierarchy\n"
js_output += "export const bangladeshAdministrativeData = " + json.dumps(result, ensure_ascii=False, indent=2) + ";\n"

with open(r'client/public/bangladeshAdministrativeData.js', 'w', encoding='utf-8') as f:
    f.write(js_output)

print("\n✓ JavaScript object saved to: client/public/bangladeshAdministrativeData.js")

# Also save as JSON for reference
with open(r'client/public/bangladeshAdministrativeData.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("✓ JSON object saved to: client/public/bangladeshAdministrativeData.json")

# Print sample output
print("\n=== Sample Output Structure ===")
print("Sample Division:")
print(json.dumps(result['divisions'][0], ensure_ascii=False, indent=2))
print("\nSample District:")
print(json.dumps(result['districts'][0], ensure_ascii=False, indent=2))
print("\nSample Upazila:")
print(json.dumps(result['upazilas'][0], ensure_ascii=False, indent=2))
print("\nSample Thana:")
print(json.dumps(result['thanas'][0], ensure_ascii=False, indent=2))
