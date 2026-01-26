# Makefile for Lensing Visualization
# ===================================

.PHONY: help install dev start lint lint-fix format format-check clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make start        - Start development server (alias)"
	@echo "  make lint         - Run ESLint"
	@echo "  make lint-fix     - Run ESLint with auto-fix"
	@echo "  make format       - Format code with Prettier"
	@echo "  make format-check - Check code formatting"
	@echo "  make clean        - Remove node_modules"

# Install dependencies
install:
	@command -v npm >/dev/null 2>&1 || { echo "Error: npm is not installed. Please install Node.js from https://nodejs.org/"; exit 1; }
	npm install

# Start development server (requires Python 3)
dev:
	@command -v python3 >/dev/null 2>&1 || { echo "Error: python3 is not installed."; exit 1; }
	python3 -m http.server 8080

start: dev

# Linting
lint:
	npm run lint

lint-fix:
	npm run lint:fix

# Formatting
format:
	npm run format

format-check:
	npm run format:check

# Clean up
clean:
	rm -rf node_modules
	rm -f package-lock.json

# Reinstall everything
reinstall: clean install
