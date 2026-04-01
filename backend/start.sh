#!/bin/bash
java -Dserver.port=${PORT:-8080} -jar target/nptelify-0.0.1-SNAPSHOT.jar
