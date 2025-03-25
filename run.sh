#!/bin/bash

echo -e "\n==================================================="
echo "      Starting VocalCanvas Application"
echo -e "===================================================\n"
echo "Starting development server..."
echo -e "\nThe application will open in your default browser shortly."
echo "To stop the server, press Ctrl+C in this window."
echo -e "\n"

npm run dev
if [ $? -ne 0 ]; then
    echo "Error starting development server."
    exit 1
fi 