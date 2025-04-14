# Stage 1: Ollama Service
# FROM ollama/ollama AS ollama
# EXPOSE 11434

# ENV OLLAMA_ORIGINS="*"
# ENV OLLAMA_HOST="0.0.0.0:11434"

# # Pre-pull the model
# RUN ollama serve & \
#     sleep 5 && \
#     ollama pull mistral && \
#     pkill ollama

# Stage 1: Frontend Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-slim
WORKDIR /app

# Copy built frontend from second stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 80

# Start the service
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "80"]
