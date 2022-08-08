# This script will run the end-to-end tests and produce a report.
# It expects the project to be built and available in dist/parteng-bo-front.

# The set -e will exit the script if any statement returns a non-true return value.
set -e
# Ensure we have a clean environment
rm -rf ./cypress/report/*
#  start-server-and-test starts two processes:
#  - angular-http-server: a dedicated local server for SPA applications
#  - cypress headless test runner
npx start-server-and-test ci:start-server http://localhost:4200 cypress:run
# Merge all the mocha JSON reports into one file
npx mochawesome-merge ./cypress/report/specs-reports/*.json > ./cypress/report/report.json
# And finally, produce a HTML report
npx marge --reportDir ./cypress/report ./cypress/report/report.json
# Clean up for confort
rm ./cypress/report/report.json
rm -rf ./cypress/report/specs-reports
