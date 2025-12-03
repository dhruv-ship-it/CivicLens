#!/usr/bin/env python3
"""
Script to start all services for the Civic Lens application
"""
import subprocess
import sys
import os
import signal
import time

# Global list to keep track of processes
processes = []

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\nShutting down all services...")
    for process in processes:
        try:
            process.terminate()
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
    sys.exit(0)

def start_service(cmd, cwd=None):
    """Start a service and track its process"""
    try:
        process = subprocess.Popen(cmd, cwd=cwd, shell=True)
        processes.append(process)
        return process
    except Exception as e:
        print(f"Failed to start service with command '{cmd}': {e}")
        return None

def main():
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    print("Starting Civic Lens services...")
    
    # Start MongoDB (assuming it's installed as a service)
    print("1. Make sure MongoDB is running")
    
    # Start backend
    print("2. Starting backend...")
    backend_process = start_service("npm run dev", cwd="backend")
    if not backend_process:
        print("Failed to start backend")
        return
    
    # Wait a moment for backend to start
    time.sleep(2)
    
    # Start ML service
    print("3. Starting ML service...")
    ml_process = start_service("python predict.py", cwd="backend/ml")
    if not ml_process:
        print("Failed to start ML service")
        return
    
    # Wait a moment for ML service to start
    time.sleep(2)
    
    # Start citizen frontend
    print("4. Starting citizen frontend...")
    citizen_process = start_service("npm run dev", cwd="citizen")
    if not citizen_process:
        print("Failed to start citizen frontend")
        return
    
    # Start department frontend
    print("5. Starting department frontend...")
    department_process = start_service("npm run dev", cwd="department")
    if not department_process:
        print("Failed to start department frontend")
        return
    
    print("\nAll services started successfully!")
    print("Access the applications at:")
    print("- Backend API: http://localhost:5000")
    print("- ML Service: http://localhost:5001")
    print("- Citizen Portal: http://localhost:3000")
    print("- Department Portal: http://localhost:3001")
    print("\nPress Ctrl+C to stop all services")
    
    # Wait for all processes
    try:
        for process in processes:
            process.wait()
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    main()