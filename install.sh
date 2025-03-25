#!/bin/bash

echo -e "\n==================================================="
echo "        Installing VocalCanvas Application"
echo -e "===================================================\n"

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error installing dependencies. Please check your npm installation."
    exit 1
fi

echo -e "\nInstallation completed successfully!"
echo "Run ./run.sh to start the application." 