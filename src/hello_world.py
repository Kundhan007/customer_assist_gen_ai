#!/usr/bin/env python3
import sys
import os

def main():
    print("Hello from Python!")
    print(f"Python version: {sys.version}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python executable: {sys.executable}")
    return "Hello World Response"

if __name__ == "__main__":
    result = main()
    print(f"Function result: {result}")
