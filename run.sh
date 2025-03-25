#!/bin/bash

echo -e "\n==================================================="
echo "      Starting VocalCanvas Application"
echo -e "===================================================\n"
echo "Starting development server..."
echo -e "\nThe application will open in your default browser shortly."
echo "To stop the server, press Ctrl+C in this window."
echo -e "\n"

# Open browser based on OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000 &
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000 &
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" ]]; then
    start http://localhost:3000 &
fi

npm run dev
if [ $? -ne 0 ]; then
    echo "Error starting development server."
    exit 1
fi 