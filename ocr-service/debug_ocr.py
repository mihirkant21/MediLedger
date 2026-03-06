from paddleocr import PaddleOCR
import traceback
import sys

print("Starting PaddleOCR debug...")

def test_config(name, **kwargs):
    print(f"\nTesting config: {name} with args: {kwargs}")
    try:
        ocr = PaddleOCR(**kwargs)
        print(f"✅ Success: {name}")
        return True
    except Exception as e:
        print(f"❌ Failed: {name}")
        traceback.print_exc()
        return False

# Test 1: Minimal (Default)
if not test_config("Default"):
    print("Default failed, trying explicit CPU...")

# Test 2: CPU Only
if not test_config("CPU Only", use_gpu=False):
    print("CPU failed...")

# Test 3: CPU + Angle
test_config("CPU + Angle", use_gpu=False, use_angle_cls=True)

# Test 4: Full App Config
test_config("Full App Config", use_gpu=False, use_angle_cls=True, lang='en')

