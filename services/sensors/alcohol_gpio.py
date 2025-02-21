import RPi.GPIO as GPIO
import time
import json
import sys

# Pin configuration
PINS = {
    'ALCOHOL_READY': 17,
    'ALCOHOL_SOBER': 27,
    'ALCOHOL_DRUNK': 22,
    'ALCOHOL_POWER': 23,
    'ALCOHOL_TOGGLE': 14
}

# Setup GPIO
def setup_gpio():
    try:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(PINS['ALCOHOL_READY'], GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(PINS['ALCOHOL_SOBER'], GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(PINS['ALCOHOL_DRUNK'], GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(PINS['ALCOHOL_POWER'], GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.setup(PINS['ALCOHOL_TOGGLE'], GPIO.OUT)
        GPIO.output(PINS['ALCOHOL_TOGGLE'], GPIO.LOW)
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

def read_sensors():
    try:
        return {
            'ready': GPIO.input(PINS['ALCOHOL_READY']),
            'sober': GPIO.input(PINS['ALCOHOL_SOBER']),
            'drunk': GPIO.input(PINS['ALCOHOL_DRUNK']),
            'power': GPIO.input(PINS['ALCOHOL_POWER'])
        }
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        
def toggle_sensor():
    try:
        GPIO.output(PINS['ALCOHOL_TOGGLE'], GPIO.HIGH)
        time.sleep(0.5)
        GPIO.output(PINS['ALCOHOL_TOGGLE'], GPIO.LOW)
        return True
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        return False

if __name__ == "__main__":
    setup_gpio()
    while True:
        try:
            data = read_sensors()
            print(json.dumps(data))
            time.sleep(0.1)  # 10Hz sampling rate
        except KeyboardInterrupt:
            GPIO.cleanup()
            break
        except Exception as e:
            print(json.dumps({'error': str(e)}))
            time.sleep(1)